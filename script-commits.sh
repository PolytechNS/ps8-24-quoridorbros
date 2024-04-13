# https://stackoverflow.com/questions/10622179/how-to-find-identify-large-commits-in-git-history
# https://stackoverflow.com/a/42544963/4121010

git rev-list --objects --all \
| git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
| sed -n 's/^blob //p' \
| sort --numeric-sort --key=2 \
| cut -c 1-12,41- \
| $(command -v gnumfmt || echo numfmt) --field=2 --to=iec-i --suffix=B --padding=7 --round=nearest

# To achieve further filtering, insert any of the following lines before the sort line.
# To exclude files that are present in HEAD, insert the following line:
#
# | grep -vF --file=<(git ls-tree -r HEAD | awk '{print $3}') \
#
# To show only files exceeding given size (e.g. 1 MiB = 220 B), insert the following line:
#
# | awk '$2 >= 2^20' \
#
# To generate output that's more suitable for further processing by computers, omit the last
# two lines of the base script. They do all the formatting.