gh-pages:
	git merge master
	echo 'node_modules' > .gitignore
	npm run build
	git add --all
	git commit -m "Update Github pages"
	git push -u origin gh-pages
