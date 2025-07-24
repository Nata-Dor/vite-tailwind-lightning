#!/bin/bash

# GitHub Repository Setup Script
# This script helps you create and push your project to GitHub

echo "🚀 Setting up GitHub repository for vite-tailwind-lightning..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote repository already configured"
else
	echo "🔗 Please enter your GitHub repository user name:"
    echo "(to be used in Format: https://github.com/YOUR_USERNAME/... )"
	set /p YOUR_USERNAME=Github YOUR_USERNAME: 
	
    read -p "Github YOUR_USERNAME: " YOUR_USERNAME
	 if [ -n "$YOUR_USERNAME" ]; then
		echo "✅  You entered: $YOUR_USERNAME"
        git config --global user.name "$YOUR_USERNAME"
		echo "Git current user is:"		
        git config --global user.name 	
        #git config --global user.email "you@example.com"		
	else 
		echo "No user name entered. Exiting..."
		read -p "❌  Press ENTER to exit ..."
		echo ""
		exit 1
	fi	

	value="$PWD"
	parent_dir="${value##*/}"
	REPO_NAME="$parent_dir"
	echo "Default project name would be $REPO_NAME"
	read -p "Enter a value (Press Enter for default '$REPO_NAME'): "  REPO_NAME
	REPO_NAME="${REPO_NAME:-$parent_dir}" # Assign default if REPO_NAME is empty or unset
 	echo "You entered: $REPO_NAME"
	if [ -n "$REPO_NAME" ]; then
		echo "✅  You entered: $REPO_NAME"
	else
		echo "No repo name entered. Exiting..."
		read -p "❌  Press ENTER to exit ..."
		echo ""
		exit 1	
	fi
 
    
	REPO_URL="https://github.com/$YOUR_USERNAME/$REPO_NAME.git"
	echo "Remote repo will be set to  $REPO_URL"	
	
	    
    if [ -n "$REPO_URL" ]; then
		#git config --global credential.helper 'store --file ~/.git-credentials'
		#git credential approve			
		 # git credential fill
        git remote add origin $REPO_URL
        echo "✅ Remote repository added"
    else
        echo "❌ No repository URL provided. Please add manually with:"
        echo "git remote add origin YOUR_REPOSITORY_URL"
    fi
	
	git config credential.helper store
	git ls-remote origin
	exit_status=$?
	if [ "$exit_status" -ne 0 ]; then
		echo "Error: Access failed with exit status $exit_status"
		# Perform error handling actions, e.g., exit the script
		git remote remove origin
		echo ❌ Remote origin removed. Please run this script again
		exit 1
	else
		echo ✅ Accessed successfully
 fi	
	
fi

# Add all files
echo "📁 Adding files to git..."
git add .
git commit -m "Initial commit: Vite + Tailwind CSS + Lightning CSS starter"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main
exit_status=$?
if [ "$exit_status" -ne 0 ]; then
    echo "Error: git push failed with exit status $exit_status"
    # Perform error handling actions, e.g., exit the script
	git remote remove origin
	echo ❌ Remote origin removed. Please run this script again
    exit 1
 else
    echo ✅ Pushed successfully
 fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to 'Pages' section"
echo "3. Select 'GitHub Actions' as source"
echo "4. Your site will be deployed automatically!"
echo ""
echo "Your site will be available at: https://YOUR_USERNAME.github.io/vite-tailwind-lightning"