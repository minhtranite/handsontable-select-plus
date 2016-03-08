# Handsontable select plus

## Installation

```bash
bower install --save handsontable-select-plus
```

## Usage

```html
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='UTF-8'>
    <title>Handsontable Select Plus</title>
    <link rel='stylesheet'
      media='screen'
      href='bower_components/handsontable/dist/handsontable.full.css'>
    <link rel='stylesheet' href='handsontable-select-plus.css'/>

    <script src='bower_components/handsontable/dist/handsontable.full.js'></script>
    <script src='handsontable-select-plus.js'></script>
  </head>
  <body>
    <div id='example'></div>
    <button id='button' onclick='getData()'>Get data</button>
    <script>
      var data = [
        ['Key', 'Value'],
        ['one', 'AL'],
        ['two', ''],
        ['three', '']
      ];

      var columns = [
        {},
        {
          type: 'selectPlus',
          form: true, // true to show form, false to hide form, default true
          items: [
            {
              label: 'Afghanistan',
              value: 'AF'
            },
            {
              label: 'Åland Islands',
              value: 'AX'
            },
            {
              label: 'Albania',
              value: 'AL'
            },
            {
              label: 'Algeria',
              value: 'DZ'
            },
            {
              label: 'American Samoa',
              value: 'AS'
            },
            {
              label: 'AndorrA',
              value: 'AD'
            },
            {
              label: 'Angola',
              value: 'AO'
            }
          ]
        }
      ];

      var container = document.getElementById('example');
      var hot = new Handsontable(container, {
        data: data,
        columns: columns
      });

      var getData = function () {
        console.log(hot.getData());
      }
    </script>
  </body>
</html>
```

## Example

```bash
git clone https://github.com/vn38minhtran/handsontable-select-plus.git
cd handsontable-select-plus
npm install && bower install
npm start
```