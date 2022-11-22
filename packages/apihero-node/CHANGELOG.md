# @apihero/js

## 1.3.15

### Patch Changes

- 2553692: Split node and browser packages into two different packages

## 1.3.14

### Patch Changes

- 484d2c3: Allow start to be called repeatedly, and run the callback only once

## 1.3.13

### Patch Changes

- da2956b: Renamed setupProxy to setupFetchProxy for fetch environments

## 1.3.12

### Patch Changes

- b30ef59: Proxy start does not need to be async

## 1.3.11

### Patch Changes

- c997cf6: Added default url for browser proxy

## 1.3.10

### Patch Changes

- 87ad484: Remove matcher dependency as it was breaking (shakes fist at ESM)

## 1.3.9

### Patch Changes

- 83426ad: Added the node/package.json file

## 1.3.8

### Patch Changes

- e2c0ef6: Rename @apihero/js to apihero-js

## 1.3.7

### Patch Changes

- 075e0d3: Try to fix the @apihero/js exports

## 1.3.6

### Patch Changes

- 3853e5a: Remove default from exports

## 1.3.5

### Patch Changes

- a9bcb3b: Use legacy esm output to avoid mjs extensions

## 1.3.4

### Patch Changes

- 38335bc: Added the import property to the node export

## 1.3.3

### Patch Changes

- 5d425fc: Removed @apihero/constants-js internal package

## 1.3.2

### Patch Changes

- 7332423: Converted @apihero/constants-js to an internal package

## 1.3.1

### Patch Changes

- 41c71ed: Try fixing ERR_UNSUPPORTED_DIR_IMPORT error

## 1.3.0

### Minor Changes

- 68a0011: Add support for intercepting node native fetch calls

### Patch Changes

- dd6a9f2: Added a default proxy url so including the url is optional

## 1.2.0

### Minor Changes

- 8f3dd26: Add support for API Hero in Cloudflare Workers (or any other web-fetch environment)

### Patch Changes

- Updated dependencies [8f3dd26]
  - @apihero/interceptors-js@1.0.2

## 1.1.1

### Patch Changes

- 4af7924: Remove extra logging from the Service Worker

## 1.1.0

### Minor Changes

- ab75b66: Added support for proxying browser based requests using Service Workers

### Patch Changes

- ac04c52: Use host instead of hostname so we don't lose the port
- 234f2e4: Now able to proxy requests through local proxy to an https endpoint
- 4e29609: Added a payload to the request, that includes the environment
- 949545c: Initial beta release
- Updated dependencies [234f2e4]
- Updated dependencies [4e29609]
- Updated dependencies [949545c]
  - @apihero/interceptors-js@1.0.1
  - @apihero/constants-js@1.0.1
