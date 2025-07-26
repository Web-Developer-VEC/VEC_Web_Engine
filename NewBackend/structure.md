```
main-backend/
├── routes/
│   ├── about_us/
│   │   └── aboutUsRoutes.js
│   ├── landing_page/
│   │   └── landingPageRoutes.js
│   ├── events/
│   │   └── eventsRoutes.js
│   └── index.js
│
├── controllers/
│   ├── about_us/
│   │   └── aboutUsController.js
│   ├── landing_page/
│   │   └── landingPageController.js
│   └── events/
│       └── eventsController.js
│
├── models/
│   ├── about_usModel.js
│   ├── landing_pageModel.js
│   └── eventsModel.js
│
├── middleware/
│   ├── about_us/
│   │   └── validateAboutUs.js
│   ├── landing_page/
│   │   └── authLanding.js
│   └── events/
│       └── validateEvent.js
│
├── config/
│   └── db.js
└── utils/
    └── helpers.js
```