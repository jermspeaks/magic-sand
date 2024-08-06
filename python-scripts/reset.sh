#/bin/bash

rm -rf ./files
mkdir ./files
cp -r ~/Documents/dev-journal/Private/5_resources/58\ Digital\ Organization/58.20\ Readwise/Articles/*.md ./files/.
python3 ./markdown-remove-duplicate-lines.py

# cp -r ./files/. ~/Documents/dev-journal/Private/5_resources/58\ Digital\ Organization/58.20\ Readwise/Articles/.