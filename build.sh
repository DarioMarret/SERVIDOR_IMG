git pull
git add .
git commit -m "$(date +%Y-%m-%d_%H:%M:%S)"
git push
export SHORT_COMMIT=$(git log -1 --pretty="%H" | cut -b -8)
export DOCKER_IMAGE_VERSION="dev_${SHORT_COMMIT}"

docker login -u "djmarret1992" -p "dckr_pat_hVke026bLagbYIPeknmTQEcK_7A"

docker build -t djmarret1992/ticke-storange:${DOCKER_IMAGE_VERSION} -f Dockerfile .
docker tag djmarret1992/ticke-storange:${DOCKER_IMAGE_VERSION} djmarret1992/ticke-storange:latest
docker push djmarret1992/ticke-storange:${DOCKER_IMAGE_VERSION}
docker push djmarret1992/ticke-storange:latest
echo "tag: ${DOCKER_IMAGE_VERSION}"