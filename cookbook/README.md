# guardian cookbook

This cookbook installs and configures guardian for SAML authentication.

## Supported Platforms

- Ubuntu 14.04

## Attributes

<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><tt>['guardian']['home']</tt></td>
    <td>String</td>
    <td>Home directory for the guardian system account</td>
    <td><tt>'/home/guardian'</tt></td>
  </tr>
  <tr>
    <td><tt>['guardian']['user']</tt></td>
    <td>String</td>
    <td>System account to use for running the guardian service.</td>
    <td><tt>'guardian'</tt></td>
  </tr>
  <tr>
    <td><tt>['guardian']['src']['uri']</tt></td>
    <td>String</td>
    <td>URI to the guardian source.</td>
    <td><tt>'https://github.com/rapid7/guardian'</tt></td>
  </tr>
</table>

## Usage

### guardian::default

Include `guardian` in your node's `run_list`:

```json
{
  "run_list": [
    "recipe[guardian::default]"
  ]
}
```

This is intended to be use in conjunction with nginx, apache, or some other transparent proxy which handles SSL termination.

## License and Authors

Author:: Ryan Hass (ryan_hass@rapid7.com)
