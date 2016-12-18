# docker-node-boilerplate
docker下部署node.js应用 ( Babel, ES2015, ESLint, Dockerfile... )

node.js开发了服务器端的应用，服务器端使用Docker容器来部署和发布应用，不在服务器端单独安装node环境，完全用容器技术。

## 流程
1. 使用js ES6等在本地开发环境开发node.js应用，`src`目录为源代码主目录。
2. 本地开发调试完毕后，通过运行 `npm run build`生成发布用到的代码，这里是通过`babel`转码和使用了`gulp`的`uglify`对代码进行了压缩，生成到`lib`目录中。`lib`是最终部署到服务器上的代码。使用babel和uglify后，对代码多少进行了一些转换，如果代码被偷取，多少能提高点代码理解难度。当然这是没用的，所以要保证服务器的安全。
3. 生成镜像。通过Dockerfile的设置，生成部署到服务器用的镜像。这里生成镜像是用了官方`node`镜像的`alpine`版，因为`alpine`版的镜像比较小，而且更安全。你也可以通过修改Dockerfile先在本地通过`node`镜像的其它版本来测试。在生成镜像的过程中，通过`.dockerignore`，忽略掉复制到镜像中的文件。我们正式环境，只需要`lib`目录和`package.json`即可，然后通过`RUN npm install --only=production`将只需要服务端运行的依赖库安装上即可，忽略掉`package.json`中`devDependencies`的软件包，因为在生产环境是不需要开发环境用到的软件包。这样也可减少镜像的大小。用 `docker build ` 命令构建镜像。
4. 然后将镜像提交到Docker私有仓库，当然如果公开的化，也可以提交到Docker hub官方仓库。Docker私有仓库，可以结合阿里云OSS，这样就把镜像的文件单独放到了OSS中存储。当然这个过程可以结合自动构建和部署，比如git提交之后，自动构建镜像，提交到仓库中。在本例中，结合了Docker官方仓库和Github的自动构建，当提交到github之后，会自动构建并将镜像发布到Docker仓库中。
5. 然后在生产服务器，拉取最新的镜像，重新生成容器，应用就更新了。这过程也可以通过脚本自动化构建。

## 本例的镜像
拉取镜像
```
docker pull hahoo/node-hello
```
或直接生成容器
```
docker run -p 8080:8080 -d --name node-hello hahoo/node-hello
```
