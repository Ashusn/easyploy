EasyPloy
Automate your deployment

Its a simple deployment application where if a user gives a github repository url and a slug, the contents are cloned in an isolated container and they are built. The Redis is used to publish and subscribe to the logs that are generated during the build.
###The contents are stored in a s3 bucket and a url is generated where the built project is running.

Architecture
![image](https://github.com/Ashusn/easyploy/assets/113813476/690f0ef3-c3d6-4e79-a264-ab1f7b2b2ee1)
