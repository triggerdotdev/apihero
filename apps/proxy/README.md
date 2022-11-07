## API Hero Proxy

Proxy requests through API Hero by sending a request to `proxy.apihero.run` with the `x-origin-url` set to the destination URL.

For example, to make a `GET https://api.github.com/repos/apihero-run/jsonhero-web` request, you would do:

```bash
curl "x-origin-url: https://api.github.com/repos/apihero-run/jsonhero-web" https://proxy.apihero.run
```
