Guardian
========

Installs and configures Guardian services.

## Supported Platforms

- Ubuntu 16.04, 18.04

## Usage

### guardian::default

This recipe will build a stand-alone instance fo the Guardian stack, including databases. Include `guardian` in your node's `run_list`:

```json
{
  "run_list": [
    "recipe[guardian::default]"
  ]
}
```

## License and Authors

- Author:: John Manero (jmanero@rapid7.com)
- Author:: Ryan Hass (ryan_hass@rapid7.com)
