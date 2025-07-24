@echo off
@chcp 65001

echo 🚀 Setting up GitHub repository for vite-tailwind-lightning...
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing git repository...
    git init
    git branch -M main
)

REM Check if remote already exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Remote repository already configured
) else (
    echo 🔗 Please enter your GitHub repository user name:
    echo (to be used in Format: https://github.com/YOUR_USERNAME/... )
	set /p YOUR_USERNAME=Github YOUR_USERNAME: 
	if defined YOUR_USERNAME (
		echo You entered: %YOUR_USERNAME%	
		  git config --global --add safe.directory C:/Windows/System32
		git config --local --unset credential.helper
		rem git config --global credential.helper wincred
		rem git config --global credential.helper
  git config user.name
 git config --global user.name  		
	) else (
		echo No user name entered. Exiting...
		pause
		exit 1
	)
	
	set "REPO_NAME=vite-tailwind-lightning" 		REM Set the default value
	set /p REPO_NAME=Enter a value (Press Enter for default '%REPO_NAME%'): 
	echo You entered: %REPO_NAME% 	
 
    
	set REPO_URL=https://github.com/%YOUR_USERNAME%/%REPO_NAME%.git
	echo Remote repo will be set to  %REPO_URL% 	
    if defined REPO_NAME (
		echo Executing git remote add origin %REPO_NAME%  %REPO_URL% 
        git remote add origin  %REPO_URL% 
        echo ✅ Remote repository  %REPO_URL% added
    ) else (
        echo ❌ No repository URL provided. Please add manually with:
        echo git remote add origin YOUR_REPOSITORY_URL
    )
)

REM Add all files
echo 📁 Adding files to git...
git add .
git commit -m "Initial commit: Vite + Tailwind CSS + Lightning CSS starter"

REM Push to GitHub
echo 📤 Pushing to GitHub...
  git config user.name 
 git config --global user.name  
git push -u origin main
if %errorlevel% equ 0 ( 
    echo ✅ Pushed successfully
) else (
 git remote remove origin
 echo ❌ Remote origin removed. Please run this script again
 pause
 exit
)

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Go to your GitHub repository settings
echo 2. Navigate to 'Pages' section
echo 3. Select 'GitHub Actions' as source
echo 4. Your site will be deployed automatically!
echo.
echo Your site will be available at: https://%YOUR_USERNAME%.github.io/%REPO_NAME%
pause