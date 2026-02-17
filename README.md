
```
CHATTING-APPLICATION
├─ chat-backend
│  ├─ .idea
│  │  ├─ compiler.xml
│  │  ├─ encodings.xml
│  │  ├─ jarRepositories.xml
│  │  ├─ misc.xml
│  │  └─ workspace.xml
│  ├─ .mvn
│  │  └─ wrapper
│  │     └─ maven-wrapper.properties
│  ├─ Dockerfile
│  ├─ HELP.md
│  ├─ mvnw
│  ├─ mvnw.cmd
│  ├─ pom.xml
│  ├─ src
│  │  ├─ main
│  │  │  ├─ java
│  │  │  │  └─ com
│  │  │  │     └─ app
│  │  │  │        └─ chat
│  │  │  │           ├─ ChatApplication.java
│  │  │  │           ├─ config
│  │  │  │           │  ├─ JwtAuthenticationFilter.java
│  │  │  │           │  ├─ JwtService.java
│  │  │  │           │  ├─ SecurityConfig.java
│  │  │  │           │  └─ WebSocketConfig.java
│  │  │  │           ├─ controller
│  │  │  │           │  ├─ AuthController.java
│  │  │  │           │  ├─ ChatController.java
│  │  │  │           │  ├─ FileController.java
│  │  │  │           │  ├─ FriendController.java
│  │  │  │           │  ├─ GlobalExceptionHandler.java
│  │  │  │           │  └─ UserController.java
│  │  │  │           ├─ dto
│  │  │  │           │  ├─ ChatMessageDTO.java
│  │  │  │           │  ├─ FriendRequestDTO.java
│  │  │  │           │  ├─ LoginRequest.java
│  │  │  │           │  ├─ RegisterRequest.java
│  │  │  │           │  └─ TypingStatusDTO.java
│  │  │  │           ├─ entity
│  │  │  │           │  ├─ DeletedMessage.java
│  │  │  │           │  ├─ Friend.java
│  │  │  │           │  ├─ FriendRequest.java
│  │  │  │           │  ├─ Message.java
│  │  │  │           │  └─ User.java
│  │  │  │           ├─ model
│  │  │  │           ├─ repository
│  │  │  │           │  ├─ DeletedMessageRepository.java
│  │  │  │           │  ├─ FriendRepository.java
│  │  │  │           │  ├─ FriendRequestRepository.java
│  │  │  │           │  ├─ MessageRepository.java
│  │  │  │           │  └─ UserRepository.java
│  │  │  │           └─ service
│  │  │  │              ├─ AuthService.java
│  │  │  │              ├─ ChatService.java
│  │  │  │              ├─ CustomUserDetailsService.java
│  │  │  │              ├─ FileService.java
│  │  │  │              ├─ FriendService.java
│  │  │  │              ├─ PresenceService.java
│  │  │  │              └─ UserService.java
│  │  │  └─ resources
│  │  │     ├─ application.properties
│  │  │     ├─ static
│  │  │     └─ templates
│  │  └─ test
│  │     └─ java
│  │        └─ com
│  │           └─ app
│  │              └─ chat
│  │                 └─ ChatApplicationTests.java
│  ├─ target
│  │  ├─ classes
│  │  │  ├─ application.properties
│  │  │  └─ com
│  │  │     └─ app
│  │  │        └─ chat
│  │  │           ├─ ChatApplication.class
│  │  │           ├─ config
│  │  │           │  ├─ JwtAuthenticationFilter.class
│  │  │           │  ├─ JwtService.class
│  │  │           │  ├─ SecurityConfig.class
│  │  │           │  └─ WebSocketConfig.class
│  │  │           ├─ controller
│  │  │           │  ├─ AuthController.class
│  │  │           │  ├─ ChatController.class
│  │  │           │  ├─ FileController.class
│  │  │           │  ├─ FriendController.class
│  │  │           │  ├─ GlobalExceptionHandler.class
│  │  │           │  └─ UserController.class
│  │  │           ├─ dto
│  │  │           │  ├─ ChatMessageDTO.class
│  │  │           │  ├─ FriendRequestDTO.class
│  │  │           │  ├─ LoginRequest.class
│  │  │           │  ├─ RegisterRequest.class
│  │  │           │  └─ TypingStatusDTO.class
│  │  │           ├─ entity
│  │  │           │  ├─ DeletedMessage.class
│  │  │           │  ├─ Friend.class
│  │  │           │  ├─ FriendRequest$Status.class
│  │  │           │  ├─ FriendRequest.class
│  │  │           │  ├─ Message$MessageType.class
│  │  │           │  ├─ Message.class
│  │  │           │  └─ User.class
│  │  │           ├─ repository
│  │  │           │  ├─ DeletedMessageRepository.class
│  │  │           │  ├─ FriendRepository.class
│  │  │           │  ├─ FriendRequestRepository.class
│  │  │           │  ├─ MessageRepository.class
│  │  │           │  └─ UserRepository.class
│  │  │           └─ service
│  │  │              ├─ AuthService.class
│  │  │              ├─ ChatService.class
│  │  │              ├─ CustomUserDetailsService.class
│  │  │              ├─ FileService.class
│  │  │              ├─ FriendService.class
│  │  │              ├─ PresenceService.class
│  │  │              └─ UserService.class
│  │  ├─ generated-sources
│  │  │  └─ annotations
│  │  ├─ generated-test-sources
│  │  │  └─ test-annotations
│  │  ├─ maven-status
│  │  │  └─ maven-compiler-plugin
│  │  │     ├─ compile
│  │  │     │  └─ default-compile
│  │  │     │     ├─ createdFiles.lst
│  │  │     │     └─ inputFiles.lst
│  │  │     └─ testCompile
│  │  │        └─ default-testCompile
│  │  │           ├─ createdFiles.lst
│  │  │           └─ inputFiles.lst
│  │  └─ test-classes
│  │     └─ com
│  │        └─ app
│  │           └─ chat
│  │              └─ ChatApplicationTests.class
│  └─ uploads
│     ├─ 1771312708240-a51814a5-27f9-4ad6-bd7a-3aa3d9c201fb-WhatsApp Image 2025-12-18 at 5.54.12 PM.jpeg
│     ├─ 1771312724663-9e706707-95e5-47fe-b35c-be4dfb0c355d-WhatsApp Image 2025-12-18 at 5.54.12 PM.jpeg
│     ├─ 1771313397065-fd81e9e7-ca82-44d4-b128-56335bb01618-btech.pdf
│     ├─ 1771313912670-75da0885-a1aa-41b6-aae5-8c041718e8d3-PASS PHOTO.jpeg
│     ├─ 1771314370370-b6d608fd-d61b-48ed-a953-ea5db07e1c7a-20251117_011953.jpg
│     ├─ 1771316133689-978bfac8-c2b8-4b39-b3c2-3a9238cfb100-voice-1771316133098.webm
│     ├─ 1771316558287-087891b0-2fef-467f-affb-85b5048d8490-voice-1771316558151.webm
│     ├─ 1771317089609-f72e65cd-f726-4ce4-9d5a-5ffd75db6ab6-voice-1771317089536.webm
│     ├─ 1771324034397-e78624ab-a73c-4e0d-a7dc-9ed9c19523c4-voice-1771324034124.webm
│     └─ 1771325516647-097b75c4-e659-486d-ac92-443b130be7de-IMG_1382.JPG
└─ chat-frontend
   ├─ dist
   │  ├─ assets
   │  │  ├─ index-ajyZ03Ay.css
   │  │  └─ index-cRt2zIyx.js
   │  ├─ index.html
   │  ├─ login-bg.mp4
   │  └─ vite.svg
   ├─ eslint.config.js
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.js
   ├─ public
   │  ├─ login-bg.mp4
   │  └─ vite.svg
   ├─ README.md
   ├─ src
   │  ├─ App.jsx
   │  ├─ assets
   │  │  └─ react.svg
   │  ├─ components
   │  │  └─ ProtectedRoute.jsx
   │  ├─ index.css
   │  ├─ lib
   │  │  ├─ api.js
   │  │  └─ auth.js
   │  ├─ main.jsx
   │  └─ pages
   │     ├─ AuthPage.jsx
   │     ├─ ChatContactPage.jsx
   │     ├─ ChatPage.jsx
   │     └─ DashboardPage.jsx
   ├─ tailwind.config.js
   └─ vite.config.js

```"# CHATTING-APPLICATION." 
