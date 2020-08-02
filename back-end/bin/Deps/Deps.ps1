if ($args.Count -eq 0) {
    npm install
} else {
    npm install --save $args
}

npx flow-typed install $args