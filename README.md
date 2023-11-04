# Nit - A Simple Version Control System

Nit is a simple version control system built using Node.js. (Step Brother of Git)


## Installation

To get started, make sure you have latest version of Node.js installed. Then, follow these steps:

1. Clone this repository.
    ```
    git clone https://github.com/srijit2002/Nit.git
    ```
3. Navigate to the project directory in your terminal.
   ```
   cd Nit
   ```
4. Install the required dependencies by running:

   ```
   npm install
   ```
5. Run the following command
    ```
    npm link
    ``` 
# Commands and Use Cases
### 1. Initialize a Repository  
Initialize an empty Nit repository in your project directory.
```
  nit init
```
![image](https://github.com/srijit2002/Nit/assets/74085816/8ca6a788-4e68-41e5-b3f5-4081bf11f667)

### 2. Configuration 
View or set configuration options for your Nit repository.
```
  nit config <key> [value]
```
![image](https://github.com/srijit2002/Nit/assets/74085816/6b33fe4c-0dfc-4376-ae9a-0afaf00cee5e)

### 3. Add Changes to Staging 
Add changes in the working directory to the staging area. You can specify multiple file paths to add.
```
  nit add <paths...>
```
![image](https://github.com/srijit2002/Nit/assets/74085816/31ba522b-8746-4d49-91d7-37ab2f2fbe30)


### 4. Commit Changes
Capture a snapshot of the project's currently staged changes with a commit message.
```
  nit commit <message>
```
![image](https://github.com/srijit2002/Nit/assets/74085816/7bc1c9b1-e971-4d1d-9c53-6eced6685273)

### 5. Display Repository Status
Display the state of the working directory and the staging area
```
 nit status
```
![image](https://github.com/srijit2002/Nit/assets/74085816/8d458d0c-0e6a-4306-932e-690331c6b23a)

### 6. Show Differences
Display changes between the working directory and the index. You can specify multiple space separated file paths.
```
 nit diff [paths...]
```
![image](https://github.com/srijit2002/Nit/assets/74085816/eec0f827-e5b0-4d41-8a29-b006a97987e6)

### 7. Pretty-print Commit Logs
Display the contents of the commit logs.
```
 nit log
```
![image](https://github.com/srijit2002/Nit/assets/74085816/210c72db-cd7c-4302-ac80-f8a7b4b12434)

### 8. Revert a File to a Previous Version
Revert a file to the last committed version or a specific commit using the -c option.
```
 nit checkout <filepaths...>
```
```
 nit checkout -c <commitId> <filepaths...>
```
![image](https://github.com/srijit2002/Nit/assets/74085816/0e65b9a9-a6dd-4698-9d32-e714092bfb6d)

# Resources Used
1. [Git Internals (part-1)](https://www.developernation.net/blog/git-internals-list-of-basic-concepts-that-power-your-git-directory)
2. [Git Internals (part-2)](https://www.developernation.net/blog/git-internals-how-does-git-store-your-data)
3. [Git Internals (part-3)](https://www.developernation.net/blog/git-internals-part-3-understanding-the-staging-area-in-git)
4. [Git Internals by John Britton of GitHub - CS50 Tech Talk](https://www.youtube.com/watch?v=lG90LZotrpo)
5. [How Does Git Store Files?](https://blog.git-init.com/how-does-git-store-files/)
6. [Myers Diff Algo](https://blog.robertelder.org/diff-algorithm/)
7. [The Myers diff algorithm](https://blog.jcoglan.com/2017/02/12/the-myers-diff-algorithm-part-1/)
8. [Bufferpack](https://github.com/ryanrolds/bufferpack)
9. [Patience](https://www.buzzfeed.com/audreyworboys/patience-test)









