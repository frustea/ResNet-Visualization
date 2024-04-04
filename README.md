# ResNet Visualization Project

## Introduction

This project offers a unique opportunity to visualize the inner workings of a ResNet model by allowing you to upload your own images. By doing so, you can observe how the activation neurons behave at each layer within the network. This visualization aims to provide a deeper understanding of feature selection processes at various layers and the opportunity to identify any inactive (or "dead") neurons that do not activate for your input.
Here is snapshot of the output: 

![ResNet Activation on the bird input ](https://github.com/frustea/ResNet-Visualization/blob/main/view1.png)

![you can scroll! ](https://github.com/frustea/ResNet-Visualization/blob/main/view2.png)

## Getting Started

### Prerequisites

Before you begin, ensure you have a modern web browser installed to run the visualization tool.

### Installation

1. **Clone the Repository**

   Start by cloning the repository to your local machine:

   ```bash
   git clone <repository-url>
### Prepare Your Image

Rename your image to test.png or test.jpeg and place it in the same directory as the index.html file. This step is crucial for the visualization tool to correctly locate and process your image.

### Running the Visualization
To run the visualization tool, follow these steps:

Open the index.html file in your web browser. You can do this by right-clicking on the file and selecting your browser from the "Open With" menu or by dragging and dropping the file into the browser window.

Once the tool is loaded, it will automatically process the image named test.png or test.jpeg and display the activation neurons for each layer of the ResNet model.

### Understanding the Visualizations

As you explore the visualizations, you'll notice that each layer of the ResNet model processes the image differently. Early layers may focus on simple features like edges and textures, while deeper layers combine these features to identify more complex patterns. Keep an eye out for any neurons that don't activate, as this could indicate areas of the model that are not contributing to the final output.

### Contributing
We welcome contributions and suggestions! Feel free to open an issue or submit a pull request if you have ideas for improvements or have identified bugs.

### License
This project is licensed under the MIT License -
