@echo off
echo Initializing Git...
git init

echo Installing/Configuring Git LFS...
call git lfs install
call git lfs track "*.safetensors"
git add .gitattributes

echo Adding files...
git add .

echo Committing...
git commit -m "Upload code and model"

echo Setting branch to main...
git branch -M main

echo Adding remote origin...
git remote add origin https://github.com/Ranjith2307/wildfire-20-12-25-.git

echo Pushing to GitHub...
git push -u origin main

echo Done!
pause
