### Настройка
```sh
$ git clone git@github.com:ins77/gulp_project_rs.git my-project
$ cd my-project
$ git remote rm origin
$ rm README.md
$ npm install
```

## Структура папок и файлов
```
├── src/                       # Исходники
│   ├── fonts/                 # Шрифты
│   ├── img/                   # Изображения
│   │   └── sprites            # Спрайты
│   ├── js/                    # Скрипты
│   │   └── app.js             # Главный скрипт
│   └── sass/                  # Стили
│       ├── vendor/           # Помощники
│       ├── global/           # Общие стили, шрифты, миксины, переменные, ...
│       │   ├── base.sass      # Базовые стили (*, html, body, img, ...)
│       │   ├── fonts.sass     # Подключение шрифтов
│       │   ├── mixins.sass    # Примеси
│       │   └──sprites/        # Переменные с данными PNG спрайтов (автосборка)
│       ├── blocks/           # Блоки (навигация, хедер, футер, кнопки, ...)
│       └── app.sass           # Главный стилевой файл
├── build/                     # Сборка (автогенерация)
│   ├── fonts/                 # Шрифты
│   ├── img/                   # Изображения
│   │   └── sprites/           # Спрайты (автогенерация)
│   ├── js/                    # Скрипты
│   ├── css/                   # Стили
│   └── index.html             # Страница
├── .gitignore                 # Список исключённых файлов из Git
├── package.json               # Список модулей и прочей информации
└── readme.md                  # Документация шаблона
```

## Как собираются и используются PNG спрайты

В шаблоне предусмотрена сборка нескольких PNG спрайтов и их данных в CSS переменные.

### Добавление PNG иконок

Для создания спрайта нужно добавить папку в `src/img/sprites` и в неё PNG иконки. Важно, чтобы иконки были с чётными высотой и шириной кратными двум. Retina иконки добавлять в эту папку рядом с обычными и в конце названия файла добавить `@2x`, например:
```
└── src/
    img/
    └── sprites/
        └── emoji/
            ├── grinning.png
            ├── grinning@2x.png
            ├── joy.png
            ├── joy@2x.png
            ├── smile.png
            └── smile@2x.png
```

### Сборка спрайта

* В папке `build/img/sprites` появятся два спрайта: обычный и Retina с `@2x` и в `src/sass/global/sprites` один стилевой файл с примесями. Все файлы будут с такими же названиями, как у папки, в которой находятся его иконки. Например:
```
├── src/
│    └── sass/
│        └── global/
│            └── sprites/
│                └── emoji.scss
└── build/
    └── img/
        └── sprites/
            ├── emoji.png
            └── emoji@2x.png

```

* В сборочных папках останутся только актуальные спрайты и стили в случае, если удалить исходные папки с иконками.

### Использование спрайтов

#### Retina спрайты

Для подключения иконки используется примесь `retina-sprite` со значением `$icon-group`, где `icon` это название PNG иконки, например:
```css
.joy
  +retina-sprite($joy-group)
```

В собранном виде в CSS добавятся обычный спрайт и медиа-запрос, чтобы отображать Retina спрайт только при необходимости и это будет выглядеть так:
```css
.joy {
    background-image: url("../img/sprites/emoji.png");
    background-position: 32px 0px;
    width: 24px;
    height: 24px;
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .joy {
        background-image: url("../img/sprites/emoji@2x.png");
        background-size: 88px 24px;
    }
}
```

#### Обычные спрайты

Для подключения иконки используется примесь `sprite` со значением `$icon`, где `icon` это название PNG иконки, например:
```css
.joy
  +sprite($joy)
```

В собранном виде в CSS добавится только обычный спрайт и это будет выглядеть так:
```css
.joy {
    background-image: url("../img/sprites/emoji.png");
    background-position: 32px 0px;
    width: 24px;
    height: 24px;
}
```
