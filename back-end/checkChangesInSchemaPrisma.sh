# -z tests if the string is null or empty):
# if difference is null, no changes made in schema yet

if [[ -z $(git diff --stat HEAD -- prisma/schema.prisma) ]]; then
    echo "No changes made in schema.prisma yet."
    git fetch
    git checkout -m origin/master -- /back-end/prisma/schema.prisma
    git add prisma/schema.prisma
else 
    echo "There are changes in schema.prisma."
fi