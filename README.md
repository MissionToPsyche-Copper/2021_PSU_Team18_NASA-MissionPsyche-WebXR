# 2021 PSU_Team18-SWENG480
NASA WebXR

## Instructions for System End Users 

While visiting a location participating in NASA’s Museum & Informal Education Alliance, users will be able to scan a QR code on their phone to allow them to open our experience. The QR code will direct them to the website provided to us by NASA, where they will enter the experience.
If the user does not have the required WebXR software installed, they may be prompted by their browser to install additional software from their respective app store as shown below.

Once the user has successfully loaded into the experience, they will be prompted to select an orbit (A-D) for viewing (Fig. 37).

After choosing an orbit, the user will be presented with educational information about the selected orbit and the corresponding instrument (Fig. 38). From here, they can click on the instrument on the spacecraft to see that instrument’s “view” overlaid on the asteroid (Fig. 39).
![code](/Resources/orbit-panel.png)


### How to set up the development environment 
Installing JetBrains’s WebStorm IDE is required to build, view, and run the code. To install WebStorm follow these steps:
1. Go to https://www.jetbrains.com/webstorm/download
2. Select your operating system if it wasn’t already automatically selected
3. Click ‘Download’

<!-- image will go here --> 
![webstorm downloads page](/Resources/orbits-btn.png "Webstorm Downloads Page")

Once you have WebStorm installed the next step would be to clone the repository. Our repo is currently set to private so you would need to be added as a collaborator to actually see the project, but these steps assume that the repository settings are set to public.

### Getting the Code

**Option 1:** Cloning this Repository from GitHub Directly
1. On the main page of this repo click the green button that says “Code”
<!-- add images -->
![code](/Resources/git_repo.png)

2. In the dropdown select whatever clone or download option preferred
![code](/Resources/git_code.png)

3. Once finished, open WebStorm
4. When you arrive to the main screen select ‘open’ 
![code](/Resources/webstorm_open_project.png)

5. Navigate to the folder where you cloned the repository
6. Open the project

**Option 2:** Cloning the Repository using WebStorm VCS

1. After installing WebStorm open the program
2. In the main window select the ‘Get from VCS’ option
3. In the following window that opens either use the repository URL or select GitHub
4. After signing into your account, the available repositories will be displayed
<!-- image -->
![code](/Resources/webstorm_projects.png)

5. Select on the repo name you would like to clone
6. Click ‘Clone’ 
7. Once cloned the project will open
8. Open the index.html
<!-- image -->
![code](/Resources/webstorm_code.png)

10. Hovering over the file will cause a browser menu to appear
11. Click on any of the browsers to view the running code


## For Windows local server setup:

1. Clone and configure the project as shown in section 10.1.1
2. Install the Web Server for Chrome application (Fig. 31).
<!-- image -->
![code](/Resources/webserver_ext.png)

3. In the Chrome browser, in the address field, type ‘chrome://apps’ and return.
4. Configure your web server as shown below:
<!-- image -->
![code](/Resources/webserver_settings.png)

5. The ‘CHOOSE FOLDER’ button is used to navigate to the root folder for the Psyche WebXR project.
6. ‘Automatically show index.html’ is optional, but if it is not checked when you load the local server you will need to manually navigate to index.html to load the WebXR experience.
7. Toggle the Web Server off, and on again since you have made changes.
<!-- image -->
![code](/Resources/start_webserver.png)

8. This concludes a local server setup for hosting of the WebXR experience accessible on your local network. With further configuration, your mobile device can connect to http://127.0.0.1:8887/ to access the software.

## For mobile device connectivity:

1. On the PC device running the local server, in your chrome browser, in the address bar type ‘chrome://inspect’ and return.
2. Click on ‘Port forwarding’, and click on the ‘Enable Port Forwarding’ checkbox.
3. Connect your mobile device via USB to your PC with the local server running. For Android devices, you will likely need to enable Developer Options, as well as USB Debugging. 
4. Navigate to http://127.0.0.1:8887/ on your mobile device browser. Try using different browsers to verify connectivity. 

***NOTE: This step may take quite some time for the server to recognize your device connection. Be patient, it may take a bit. If you still have issues, try:
Restarting the server, and re-enabling port forwarding.***

Enter Developer Options on the device, and toggle “USB Debugging” off, disconnect the USB-C to your mobile device, revoke USB debugging authorizations, toggle “USB Debugging” on, reconnect USB-C, and make sure to accept authorization as shown below:
<!-- image -->
![code](/Resources/usb_debugging.png)

Verifying successful mobile device connection via USB Debugging and ADB. 

4.a. Once you have an established connection with your local machine, in your ‘chrome://inspect’ tab, you will see your connected device along with the web page currently viewed as shown below:

<!-- image -->
![code](/Resources/devices-remote.png)

5. Once you are able to successfully navigate to http://127.0.0.1:8887/, you will either directly load the WebXR experience (if you checked ‘load index.html automatically’ or you will need to navigate within the file hierarchy to load the WebXR experience.

Source: https://codelabs.developers.google.com/ar-with-webxr#1
