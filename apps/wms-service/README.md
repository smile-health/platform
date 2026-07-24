## Running Locally with Docker

### Prerequisites

- Make sure **MySQL** and **Redis** are installed and running on your local machine.
- Adjust information your connection on .env.local

### Build Docker Image

```bash
docker build -t wms-app . -f Dockerfile.local
```

### Run the App

```bash
docker run -p 3000:3000 --rm wms-app
```


### Translatation / Multilingual

using argostranslate
run `node script/installArgos.js` or manual install with `pip3 install argostranslate`

check and test with python language
```py
python3 -c "
import argostranslate.package
argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()
"

### search package English to Indonesian
for pkg in available_packages:
    if pkg.from_code == 'en' and pkg.to_code == 'id':
        print('Installing:', pkg)
        argostranslate.package.install_from_path(pkg.download())
        break
```

check and test with cmd line
```bash
argos-translate --from en --to id "Hello world"
argos-translate --from id --to en "Halo dunia"
```