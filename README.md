# TPA Designer

TPA Designer is a web application that allows the user to create and edit Team Practices Agreements (TPAs) for the Governify framework. It has been developed using Vue.js 3, Vite and PrimeVue. 

## Table of contents

- [TPA Designer](#tpa-designer)
  - [Table of contents](#table-of-contents)
  - [Project setup](#project-setup)
  - [Documentation](#documentation)
    - [Vue.js 3](#vuejs-3)
    - [Vite](#vite)
    - [PrimeVue](#primevue)
    - [SimpleCodeEditor](#simplecodeeditor)
  - [Governify specific configuration](#governify-specific-configuration)
  - [Contributing](#contributing)
  - [Authors](#authors)
  - [License](#license)
  - [Badges](#badges)


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

## Documentation

### Vue.js 3

The documentation for Vue.js 3 can be found under the following [link](https://vuejs.org/guide/introduction.html).

### Vite

The documentation for Vite can be found under the following [link](https://vitejs.dev/guide/).

### PrimeVue

The documentation for PrimeVue can be found under the following [link](https://primevue.org/).

### SimpleCodeEditor

The Code Editor component used for editing JSON, JavaScript and GraphQL is [SimpleCodeEditor](https://github.com/justcaliturner/simple-code-editor) and its documentation can be found under the following [link](https://simple-code-editor.vicuxd.com/).

## Governify specific configuration

This application has been developed to be used within the Governify framework. In order to do so, some Governify-specific tool like ***Bluejay*** must be deployed in the same server as the TPA Designer.

The following table shows the tools that must be deployed and the corresponding environment variables that must be set in the TPA Designer.

| Tool | Environment variable  | Default value | Example value |
| ---- | --------------------- | ------------- | ------------- |
| TPA Designer | - |  http://localhost:5173 | https://designer.bluejay.governify.io |
| ASSETS_MANAGER_URL | process.env.ASSETS_MANAGER_URL | http://localhost:5200 | https://assets.bluejay.governify.io/ |
| REGISTRY_URL | process.env.REGISTRY_URL | http://localhost:5400 | https://registry.bluejay.governify.io/ |
| SCOPE_MANAGER_URL | process.env.SCOPE_MANAGER_URL | http://localhost:5700 | https://scopes.bluejay.governify.io |

There are two ways to set the environment variables:

1. Create a `.env` file in the root directory of the project and set the variables there. The file should look like this:

```
ASSETS_MANAGER_URL=https://assets.bluejay.governify.io/
REGISTRY_URL=https://registry.bluejay.governify.io/
SCOPE_MANAGER_URL=https://scopes.bluejay.governify.io
```

2. Set the environment variables in the server where the TPA Designer is deployed.

In the `/src/stores/tpaEdition.js` file, there are some variables that hold the enumerated values for the different options that can be selected in the edition mode of the app. These variables are used to populate the dropdowns in the TPA Designer, among other things. The values of these variables can be modified to add new types to the dropdowns. The variables are: 

- `BLOCK_TYPES`
- `COLLECTOR_EVENT_SOURCES`
- `COLLECTOR_EVENT_ENDPOINTS`
- `STEP_TYPES`
- `WINDOW_PERIOD_OPTIONS`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Authors

* **Mariano Manuel Torrado Sánchez** - [MaToSan24](https://github.com/MaToSan24)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Badges

[![DeepScan grade](https://deepscan.io/api/teams/21971/projects/25327/branches/790692/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=21971&pid=25327&bid=790692)