# Visualizing Runtime Evolution Paths in a Multidimensional Space

[![Deployment Status](https://github.com/vis-uni-bamberg/evolution-paths/actions/workflows/vite.yml/badge.svg)](https://github.com/vis-uni-bamberg/evolution-paths/actions/workflows/vite.yml)


[Paper Download](https://doi.org/10.1145/3578245.3585031)

[Try out the prototype](https://vis-uni-bamberg.github.io/evolution-paths/)


![teaser](teaser.png)

Runtime data of software systems is often of multivariate nature, describing different aspects of performance among other characteristics, and evolves along different versions or changes depending on the execution context.
This poses a challenge for visualizations, which are typically only two- or three-dimensional.
Using dimensionality reduction, we project the multivariate runtime data to 2D and visualize the result in a scatter plot.
To show changes over time, we apply the projection to multiple timestamps and connect temporally adjacent points to form trajectories.
This allows for cluster and outlier detection, analysis of co-evolution, and finding temporal patterns.
While projected temporal trajectories have been applied to other domains before, we use it to visualize software evolution and execution context changes as _evolution paths_.
We experiment with and report results of two application examples: (I) the runtime evolution along different versions of components from the _Apache Commons_ project, and (II) a benchmark suite from scientific visualization comparing different rendering techniques along camera paths.

## Installation

The application uses `npm` as the build system.

For local development clone the repository and run `npm run dev` to start the development server.

For building the application run `npm run build`.

A working copy containing all datasets is deployed under https://vis-uni-bamberg.github.io/evolution-paths/

## Paper and citation

This work was accepted at the Internation Conference on Performance Engineering [ICPE'23](https://icpe2023.spec.org/).
The paper can be accessed through the Digital Library of the ACM: https://doi.org/10.1145/3578245.3585031

To cite this work please use the following bibtex snippet:

```bibtex
@inproceedings{evolutionpaths,
    author = {Tarner, Hagen and Beck, Fabian},
    title = {Visualizing Runtime Evolution Paths in a Multidimensional Space (Work In Progress Paper)},
    year = {2023},
    isbn = {9798400700729},
    publisher = {Association for Computing Machinery},
    address = {New York, NY, USA},
    url = {https://doi.org/10.1145/3578245.3585031},
    doi = {10.1145/3578245.3585031},
    booktitle = {Companion of the 2023 ACM/SPEC International Conference on Performance Engineering},
    pages = {33–38},
    numpages = {6},
    keywords = {software visualization, software evolution, dynamic analysis, runtime performance, dimensionality reduction},
    location = {Coimbra, Portugal},
    series = {ICPE '23 Companion}
}
```