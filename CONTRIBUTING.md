## Note on Development

You should use the following workflow to build the necessary files to develop on `gridmash`.

```shell
cd ../gridmash
npm run build
npm run package
cd ../application-using-gridmash
npm remove gridmash
npm install ../gridmash/gridmash-0.0.1.tgz
```
