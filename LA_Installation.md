#LA - Installation
>Linux Apache

When serving static files or ones with primary front end services, I find the Apache has a rather painless installation for quick and dirty spin ups. We are going to do these few commands with root. The rest of what you need to do can be done with another user you create that you give the proper permissions too.


## Installation

### Updating Ubtuntu

First we need to log into the Ubtuntu server and update the apt registery.

```shell
apt-get update
```

This will grab all of the new registery files for when you get ```shell apt-get install```s. After this we are going to install apache2.

### Installing Apache2

A simple command of...

```shell
apt-get install apache2
``` 

this will grab the newest release of Apache2 and will setup all of your files. It will create a directory that will be served to the public with whatever is in there. It will look for index.html, index.htm and finally index.php. Whatever it finds, it will serve that to whoever goes to your sites ip address.

### Getting your files running.

Once you have your files local to the server (I recommend SCP or even a git hook which i will link out for my tutorial on it). All you need to do is copy the files into the public directory. You need to ensure you don't copy over the .git folder however if your going to use Git server side. This will greatly weaken your security.
