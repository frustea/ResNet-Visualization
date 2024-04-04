import pdb

import torch
from torchvision.models import resnet18, ResNet18_Weights
import os


def main():
    model = resnet18(ResNet18_Weights)
    os.makedirs('files', exist_ok=True)
    torch.save(model, os.path.join('files', 'example.pt'))
    pdb.set_trace()




if __name__ == '__main__':
    main()
