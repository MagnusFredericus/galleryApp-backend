REST API that implements the backend of a simple 'gallery app', an app for saving images, audios and videos files

=== Features
- Register, login
- Create, read, update, delete (CRUD) image files
- Create, read, update, delete (CRUD) audio files
- Create, read, update, delete (CRUD) video files
- Files metadata are stored on SQL database (SQLite3)
- File types changed after upload using Sharp and ffmpeg
- User interactions are logged using Morgan

=== Stack
- Javascript
- Node
- Express
- Multer
- Sharp
- ffmpeg
- Morgan
- bcrypt
- Sequelize
- SQLite3
- Docker