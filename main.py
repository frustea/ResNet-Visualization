import os
import pdb
from argparse import ArgumentParser
from typing import Optional

import imageio as im3
import torch
import os
import torch.nn as nn
import torchvision.utils
from torchvision.transforms import CenterCrop
from tqdm import tqdm
import json

parser = ArgumentParser()
parser.add_argument('-i', '--input', type=str, default='files/example.JPEG', help='Path to input example (JPEG).')
parser.add_argument('-m', '--model', type=str, default='files/example.pt', help='Path to Pytorch saved model')
parser.add_argument('-o', '--output', type=str, default='index.html', help='HTML Web UI output file name')
parser.add_argument('-s', '--input_size', type=int, default=224, help='Input image size of the network')
parser.add_argument('-w', '--width', type=int, default=1000, help='How many features to visualize')
args = parser.parse_args()
args.output_name = args.output.split('.html')[0] if args.output.endswith('.html') else args.output
args.output = f'{args.output}.html' if not args.output.endswith('.html') else args.output

RED = torch.Tensor([1, 0, 0]).view((3, 1, 1))


class BasicHook:
    def __init__(self, module: nn.Module, index: int):
        self.hook = module.register_forward_hook(self.base_hook_fn)
        self.activations = self.name = None
        self.index = index

    def close(self):
        self.hook.remove()

    def base_hook_fn(self, model: nn.Module, _: torch.tensor, output_t: torch.tensor):
        self.activations = output_t[0].clone().detach()
        self.name = str(model.__class__.__name__)


class HookArray:
    def __init__(self, model: nn.Module, original_image: Optional[torch.Tensor], output_size: int = 100):
        self.model = model
        self.hooks = [BasicHook(layer, i) for i, layer in enumerate(tqdm(model.modules(), desc='Preparing network'))]
        self.up = torch.nn.Upsample(size=(output_size, output_size), mode='bilinear', align_corners=False)
        self.image = self.up(original_image) if original_image is not None else None

    def save(self, folder: str, no_of_features: int = 20, alpha=0.6) -> (list, list):
        os.makedirs(folder, exist_ok=True)
        layer = 0
        layers, names, color = [], [], []
        for hook in tqdm(self.hooks, desc=f'Saving Activations to {folder}'):
            cur_colors = []
            if hook.activations.dim() < 3:
                continue
            for feature, image in enumerate(hook.activations):
                if feature == no_of_features:
                    break
                while image.dim() < 4:
                    image = image.unsqueeze(0)
                image = self.up(image)
                image = image.clamp(min=0, max=1)
                cur_colors.append(image.mean().item())
                image = (image * alpha * RED + self.image * (1 - alpha)) if self.image is not None else image
                torchvision.utils.save_image(image, os.path.join(folder, f'{layer}_{feature}.png'), normalize=True)
            layers.append(len(hook.activations))
            names.append(hook.name)
            color.append(cur_colors)
            layer += 1
        return layers, names, color


def main():
    input_image = im3.v3.imread(args.input)
    input_tensor = torch.Tensor(input_image) / 255
    while input_tensor.dim() < 4:
        input_tensor = input_tensor.unsqueeze(0)
    if input_tensor.shape[1] == 1:
        input_tensor = input_tensor.repeat(1, 3, 1, 1)
    if input_tensor.shape[-1] <= 3:
        input_tensor = input_tensor.permute([0, 3, 1, 2])
    input_tensor = CenterCrop(args.input_size)(input_tensor)

    model = torch.load(args.model)
    array = HookArray(model, input_tensor)
    model(input_tensor)
    layers, names, colors = array.save(args.output_name, no_of_features=args.width)
    colors = [torch.Tensor(color) for color in colors]
    colors = [(color - color.min()) / (color.max() - color.min()) for color in colors]
    colors = [color.cpu().numpy().tolist() for color in colors]

    with open(f'{args.output_name}.js', 'w') as file:
        print(f'var layers = {json.dumps(layers)};', f'const width={args.width};',
              f'var layer_names = {json.dumps(names)};', f'var feature_colors={colors};', sep='\n', file=file)

    with open('templates/template.html', 'r') as file:
        template = '\n'.join([line for line in file])
    template = template.replace('<NAME>', args.output_name)
    template = template.replace('<NETWORK>', model.__class__.__name__)

    with open(f'{args.output_name}.html', 'w') as file:
        print(template, file=file)

    os.system(f'open {args.output_name}.html')

    pdb.set_trace()


if __name__ == '__main__':
    main()
