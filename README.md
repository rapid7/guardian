Guardian
========

Guardian is a lightweight authentication proxy for HTTP services.  It allows
authenticating existing web applications without needing to modify the
underlying application to support authentication.  It currently supports SAML and
OAuth2, but can be easily extended to support many authentication protocols.

## Suported Protocols/Providers
* SAML (Tested with [Okta](https://www.okta.com/))
* OAuth2
* [Slack](https://slack.com/) (OAuth2 implementation)

## Usage

We recommend using the [chef cookbook](https://github.com/rapid7/guardian/blob/master/cookbook/)
contained in the `cookbook` sub-directory of the source repo to configure Guardian.  This
section (except the [Quick Start](#quick-start)) provides an overview of Guardian usage without
chef.

### Quick start

- Create a SAML 2.0 application in your SAML provider:
  - Sign on URL: https://\<myhost\>/_authn/provider/\<myapp\>/callback
  - Audience URI: https://\<myhost\>
- Configure the Guardian chef cookbook attributes (see
  [examples](https://github.com/rapid7/guardian/blob/master/cookbook/README.md#usage))
  - guardian.router.downstream (URL of your application)
    - protocol: https:
    - hostname: \<myhost\>
    - port: 443
  - guardian.router.routes (protected routes for your application):
    - /path1.hostname: localhost
    - /path1.port: 8080
    - /path2.hostname: someotherlocalapp.local
    - /path2.port: 80
  - Configure guardian.authn.providers with your SAML provider information
    - name: \<myapp\>
    - strategy: SAML
    - certificate: your SAML provider's certificate
    - params.entryPoint: the single sign-on URL from your SAML provider
    - params.issuer: the issuer URL from your SAML provider
    - params.identifierFormat: urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified
- Run the chef cookbook (recipe: guardian::default)

### Identity Provider

Guardian supports pluggable protocols and several identity providers.  Use the
following sections to configure your identity provider with one of these protocols.

#### SAML 2.0

In your SAML provider, create a new SAML 2.0 application.  Provide the following information
about your application (NOTE: your provider may have different names for these):

* **Single sign on URL / SAML Assertion Customer Service (ACS) URL**:   The Guardian callback URL.
  Append `/_authn/provider/\<myapp\>/callback` to your application's URL.  In this URL, `\<myapp\>`
  is a custom name for your application that you'll refer to when configuring Guardian.  For
  example:
  
  ```
  https://foo.example.com/_authn/provider/examplepp/callback
  ```
  
  The SAML assertion is sent to this url with a HTTP POST.
* **Audience URI / SP Entity ID**: The URL of your application.

Gather the following information from your SAML provider:

* **Entity ID / Issuer**: The unique URI for your identity provider.  Guardian will only accept
  SAML assertions from this ID.
* **Single sign-on URL**: The SSO endpoint that Guardian will send authentication requests to.
* **Public X.509 Certificate**: A PEM encoded SSL certifacte for your identity provider.  Guardian
  will validate incoming SAML assertions with this certificate.

#### OAuth2

TODO.

### Installation

We recommend you use the [chef cookbook](https://github.com/rapid7/guardian/blob/master/cookbook/)
to install Guardian.  To install manually follow these steps:

1. Install NodeJS and NPM
2. Install Redis
3. Install MySQL
4. Create a `guardian` user
5. Clone the guardian repository from GitHub and change ownership to the guardian user.
6. Run `npm install` as the guardian user from the root of the cloned repository.

### Configuration

Guardian requires several configuration files.  By default configuration files are located
in the `conf` folder in the Guardian installation directory.  You may override this with the
`-c` parameter to the Guardian binaries.

#### authn.json

Configures one or more identity providers.

##### SAML

SAML providers should contain the following parameters:

* **name**: A unique name for the provider
* **stategy**: SAML
* **certificate**: A file containing the identity providers X.509 certificate
* **params.issuer**: The Entity ID / Issuer from the identity provider
* **params.identifierFormat**:  The name ID format used by the identity provider.
  This is usually `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified`.
* **params.entryPoint**: The Single Sign-On URL for the identity provider

Example SAML configuration:
```json
{
  "authn": {
    "providers": {
      "exampleapp": {
        "name": "My SAML Provider",
        "strategy": "SAML",
        "certificate": "/etc/guardian/my-idp-cert.pem",
        "params": {
          "issuer": "http://my-idp-uri/",
          "identifierFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
          "entryPoint": "https://my-idp-host/my-idp-single-signon-url"
        }
      }
    }
  }
}
```

#### router.json

Configures the upstream web application that Guardian is proxying.

##### Downstream
Guardian rewrites redirects from the upstream application to use the Guardian
URL (similar to Nginx's [proxy_redirect](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_redirect)
directive.  The downstream configuration section contains the browser visible URL for
your application.

Configuration parameters are defined in NodeJS's
[url.format](https://nodejs.org/api/url.html#url_url_format_urlobj) method.

##### Routes
Routes define one or more proxy end points.  The configuration is keyed by the URL
path.  For each path, Guardian will reverse proxy the request to the given URL.

Configuration parameters are defined in NodeJS's
[url.format](https://nodejs.org/api/url.html#url_url_format_urlobj) method.

##### Example router configuration
```json
{
  "router": {
    "downstream": {
      "protocol": "https:",
      "hostname": "foo.example.com",
      "port": 443
    },
    "routes": {
      "/service1": {
        "hostname": "service1.example.com",
        "port": 8080
      },
      "/service2": {
        "hostname": "localhost",
        "port": 8080
      }
    }
  }
}
```


#### site.json

Global site configuration.  Currently an empty JSON hash:

```json
{}
```

#### session.json

Configures the session provider.  Currently an empty JSON hash:

```json
{}
```


### Running

Guardian runs on port 9002 by default.  In normal installations another webserver (or load
balancer) sits in front of Guardian and proxies requests to the Guardian port.

Guardian spawns several dameon processes to perform authentication and proxy requests.  The
[chef cookbook](https://github.com/rapid7/guardian/blob/master/cookbook/) will create these
services.  If you installed manually you'll need to run these daemons on
your own (or create a service for them).  All daemons are found in Guardian's `bin` directory.

* **guardian-authn**: Listens on port 9002 for http requests.  Authenticates requests and proxies them
  to guardian-router.
* **guardian-session**: Maintains authenticated sessions.
* **guardian-router**: Proxies requests to the underlying web application.

## Supported Platforms
* Ubuntu 14.04

## Maintainers
* John Manero (john_manero@rapid7.com, john.manero@gmail.com)
* Ryan Hass (ryan_hass@rapid7.com)
