if [[ "$#" -eq 0 ]]
then
    npm install
else
    npm install --save $@
fi

npx flow-typed install $@