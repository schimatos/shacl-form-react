# SHACL Form React

A HTML5 form generator for any SHACL constraint compliant to the W3C [SHACL](https://www.w3.org/TR/shacl/) standard.


[![GitHub license](https://img.shields.io/github/license/schimatos/shacl-form-react.svg)](https://github.com/schimatos/shacl-form-react/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/shacl-form-react.svg)](https://www.npmjs.com/package/shacl-form-react)
[![build](https://img.shields.io/github/workflow/status/schimatos/shacl-form-react/Node.js%20CI)](https://github.com/schimatos/shacl-form-react/tree/main/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage



```tsx

export function MyApp() {
  return <SHACLForm
      shacl={shacl}
      data={data}
    />
}
```

This library also exposes the `SHACLFormInternal` component.

## License
©2019–present
[Jesse Wright](https://github.com/jeswr), Commonwealth of Australia,
[MIT License](https://github.com/jeswr/useState/blob/master/LICENSE).
