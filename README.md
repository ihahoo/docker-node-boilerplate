# docker-node-boilerplate
docker下开发和部署node.js应用基本脚手架, 整合了数据库容器。 ( Babel, ES6, async/await, ESLint, Dockerfile, docker-compose, redis, postgresql/mysql...  )

docker容器技术作为新技术方式，可以方便的部署应用，实现了从开发、测试到生产的环境一致性。开发人员应该学习和使用docker来方便开发，提高效率，并且为最终的生产负责。作为全栈工程师，或者后端开发工程师需要学习使用和docker去搭建坏境。本例是node.js下开发后端的脚手架，其它语言的环境原理类似。本例中，并没有去使用数据库，不过因为大部分后端开发，都会涉及到数据库，所以做了整合的结构。这一切都可以通过docker-compose的配置文件，简单的配置，包括使用的数据库，这里使用了postgres数据库，你可以使用其它的，比如mysql等。如果你要开发一套云产品或微服务产品，使用docker部署发布和升级，将方便很多。

## 流程
### 1.开发环境
在开发时，可以将数据库等环境通过docker容器运行。以往的开发环境是在开发机上安装数据库等服务环境，不同的项目通过不同的数据库表分开，而用docker容器之后，每个项目都可以单独的使用容器运行一套独自的环境。使用容器技术的好处就是可以统一开发环境，比如多人开发，每个人的开发环境和版本不同，可能导致一些问题，另外就是可以统一从开发到生产的环境。

#### 1.1 安装
首先需要安装[docker](https://docs.docker.com/)和[docker-componse](https://docs.docker.com/compose/install/)环境,本机即使没有node.js环境也没关系。然后克隆本项目:
```
$ git clone https://github.com/ihahoo/docker-node-boilerplate.git
```
#### 1.2 初始化
```
$ docker-compose -f docker-compose.dev.yml run --rm web_dev npm install
```
此命令通过 `docker-compose.dev.yml` 配置文档调用 `Dockerfile-dev` 建立了 `xxxx_web_dev` 的镜像，`xxxx` 根据你项目的文件夹显示不同的名称，可以使用 `docker images` 命令查看生成的镜像。

开发环境使用的官方node镜像构建，没有使用[alpine](https://hub.docker.com/_/alpine/)版，因为开发环境要用到[pm2](https://github.com/Unitech/pm2)，而我测试使用`alpine`的node镜像建立的容器使用pm2会报错。另外开发环境没有使用精简版也方便调试。开发环境使用pm2是为了方便修改了文档之后，可以自动更新服务。

通过此命令，会调用`npm install`安装node.js依赖，安装在项目根文件夹下的`node_modules`中。而`node_modules`是作为数据卷挂到建立的开发环境镜像中，这样在开发镜像和本地都不用反复安装npm依赖了。

为什么通过以上命令先建立镜像，然后通过`run --rm web_dev npm install`运行`npm install`？因为开发环境是把当前项目根文件夹作为数据卷挂到容器中，如果直接在`docker-compose`配置文档或者`Dockerfile-dev`中运行npm install，你会发现全部运行完，却没有`node_modules`文件夹，因为初始化阶段，当前文件夹是不含`node_modules`的，这个时候先在容器里安装并建立了`node_modules`，但是随后用当前根目录挂载数据卷到容器中，就会覆盖掉容器里的根目录的内容。`node_modules`就消失了。所以，初始化阶段，分了两步。

##### 如果本机安装了Node.js环境
如果你的开发机本机有Node.js的环境，可以直接运行(不推荐)：
```
$ npm install
```
这样也会初始化安装依赖，安装到根目录`node_modules`中。

为什么不推荐这种方式呢？因为你首先要保证本机的node和npm版本和镜像中的一致，这样不会产生太大问题，否则可能应为开发环境的版本不统一，导致一些问题。最好是通过调用容器中的node来初始化安装，另外在以后的开发中，最好也到容器中去运行`npm install`, 其实即使本机没有安装node，通过容器中的node环境，也完全可以完成开发和调试。

#### 1.3 启动开发环境
```
$ docker-compose up
```
通过此命令，就启动了本机的开发环境。运行`docker ps`，可以看到开启了3个容器，包括node容器，redis容器，postgres数据库容器。这个命令调用了`docker-compose.yml`配置文件，建立了3个容器，并建立了3者的内部网络，你可以看作有3台服务器，通过内部网络连接到一起，可以通信，我们连接到了这个网络中去开发。这就是Docker容器的强大之处，而且它并不像VMware那种虚拟机需要占用本机很多资源。

注：这个过程会自动从docker官方Hub下载相关镜像。从国内直接下载很慢，建议配置镜像加速器，比如[阿里镜像加速器](https://cr.console.aliyun.com/#/accelerator)，注册账户后，会配置独立的加速器地址使用。

##### 连接数据库
本机可以通过localhost的`5432`端口访问postgres数据库，通过`6379`端口连接redis数据库。这里使用了postgres数据库，您也可以换成mysql等数据库，原理是一样的，可以通过修改`docker-compose.yml`来配置。在容器中连接数据库，通过`docker-compose.yml`中的`services`名称来连接，比如db代表postgres的hostname, redis代表redis的hostname。例：在node程序中连接redis配置项如下
```javascript
{
  host: 'redis',
  port: 6379,
  password: 'xxxxxxxx'
}
```
至此，你可以使用开发环境开发了。本机不用安装postgres，不用安装redis，甚至不用安装node，都用docker容器，是不是很酷。

##### 进入node容器
```
$ docker exec -it xxxx_web_dev /bin/bash
```
可以通过以上命令进入到node的容器内部，`xxxx_web_dev`是名称，根据你的名称输入，可以通过`docker ps`查看到。比如要通过`npm install`安装一些node模块。

注意：如果你要使用`npm install -g`全局安装模式，请修改`Dockerfile-dev`文件，将需要全局安装的模块在生成镜像的时候就安装进去，否则在容器中安装全局模块，重启容器后，就不见了，还需要重新安装。修改`Dockerfile-dev`后，请重新构建镜像。比如先`docker-compose down`再`docker-compose up --build`通过`--build`参数，重新构建镜像。

#### 1.4 停止开发环境
```
$ docker-compose stop
```
`docker-compose stop`停止后，不会删除容器，通过`docker ps -a`可以看到容器还在。

#### 1.5 终止开发环境
```
$ docker-compose down
```
`docker-compose down`会删除容器和建立的网络，通过`docker ps -a`可以看到容器不在了。

#### 1.6 卸载开发环境
```
$ docker-compose down
```
这样就先删除了容器和网络，然后
```
$ docker images
```
列出建立的开发镜像，通过命令删除镜像即可
```
$ docker rmi somename_web_dev
```
然后您可以重新初始化，建立开发环境。

#### 1.7 npm脚本
本例中，一些写在package.json中的脚本如下：

```
$ npm run build
```
构建发布文件。将`src/`下的代码，通过Babel转码和压缩后生成到`lib/`文件夹下，最终生产环境通过`lib/`下发布。
```
$ npm run dev
```
直接调用`src/`下的启动文件，启动开发，不过修改了代码后，不会自动重启，需要终止再运行才能看到变化。
```
$ npm run dev:start
```
相当于`pm2 start process.dev.json`，文件有变化，自动重启服务更新。
***注意：在docker中需要使用`pm2-dev start process.dev.json`来启动。***
```
$ npm run dev:stop
```
相当于`pm2 stop process.dev.json`, 停止pm2
```
$ npm run dev:kill
```
相当于`pm2 kill`，终止pm2启动的所有服务
```
$ npm run clean
```
删除通过`npm run build`建立的`lib/`文件夹。
```
$ npm run lint
```
代码错误检查
```
$ npm start
```
启动`lib/`下的生产环境。（首先需要`npm run build`构建)

### 2.部署到生产环境
#### 2.1 构建生成环境的应用文件
```
$ npm run build
```
通过`docker exec -it xxxxx /bin/bash`到node容器中运行以上命令，可以将要发布到生产环境的应用文件，构建到`lib/`下。
#### 2.2 生成生产环境镜像
```
$ docker build -t hahoo/node-hello:0.0.1 .
```
这个命令是通过`Dockerfile`建立镜像，使用的是node的alpine版，生成的镜像比较小，生产环境这里不使用pm2。注意，别忘记命令最后的那个`.`点。`-t hahoo/node-hello`的意思，就是给镜像加tag，名称是`hahoo/node-hello`,版本是0.0.1，由于本例子，是发布到Docker官方Hub中，请您自建仓库，将镜像推送到自己的仓库中。私有仓库，可以通过官方的[registry](https://hub.docker.com/_/registry/)，通过docker建立。

比如你的仓库地址是 `registry.domain.com`，那么镜像名称可以是：`registry.domain.com/yourname:0.0.1` 之类的

然后将这个镜像打上latest标签:
```
docker tag registry.domain.com/yourname:0.0.1 registry.domain.com/yourname:latest
```
#### 2.3 测试镜像
```
$ docker-compose -f docker-compose.prod.yml up
```
上传镜像前，先在本地测试。以上命令通过`docker-compose`建立了node和数据库的容器，挂载了数据卷，将容器设置为总是自动重启。

***注意：请修改`docker-compose.prod.yml`中的配置，以适合自己的需要***

生产环境将`config/`和`data/`作为数据卷挂载到容器中，这里是配置文件和数据库文件，以后升级镜像即可，而数据是永久的，否则数据在容器中，重启，数据就消失了。而生产环境，我们把`lib/`和通过`npm install --only=production`安装的`node_modules`封装到了镜像中。开发环境的文件和模块，不进入到生产环境中。另外在生产环境，数据库的端口不对外映射，只需要node.js容器内部网络访问。

#### 2.4 推送镜像
```
$ docker login registry.domain.com
$ docker push registry.domain.com/yourname:0.0.1
$ docker push registry.domain.com/yourname:latest
```
`registry.domain.com`是你的私有仓库。通过`docker push`将镜像上传到私有仓库。另外，也可以不用仓库的方式传送，比如docker保存和导出命令，然后在生产服务器上导入镜像。建议使用私有仓库，方便管理和版本控制及回滚。

#### 2.5 生产服务器部署
##### 第一次部署
1.在生产服务器中建立一个项目文件夹，然后，将`docker-compose.prod.yml`上传到文件夹中，重命名为`docker-compose.yml`
2.将`config/`和`data/`上传到新建的项目文件夹中。如果有其它需要永久存储的文件夹及文件，也上传到文件夹中，并配置`docker-compose.yml`挂载数据卷。
3.在服务器中新建立的这个文件夹下运行`docker-compose up`，当然要保证生产服务器也能及有权限访问你的Docker私有仓库。

##### 升级部署
进入到应用项目文件夹
```
$ docker-compose down
$ docker-compose pull
$ docker-compose up
```
当然，可以通过负载配置，不停之前服务升级切换，本例中暂没展开。

注意：如果服务器通过nginx反向代理共享80或443端口虚机配置，需要修改`docker-compose.yml`网络设置。由于这3个服务建立了独有的虚拟网络环境，需要配置nginx可以访问到node.js容器的网络，而node.js到数据库的通信只需要在独有的内部网络环境中。

应用项目文件夹下有docker-compose.yml文件和数据卷，这里是`config/`和`data/`，数据卷也可以放到专门存储数据的地方，比如NAS或者Docker的某个Datecenter之类的。

## Node.js版本及开发环境
`node.js` 版本>= 6 强烈建议使用 `ES6, ES7, ES8`等新特征开发。node6已经支持了大部分ES6新特性，不支持的用babel转码。`.babelrc`文件配置Babel设置。

- `src/`: 源代码的组织和书写请在这个文件夹下。
- [eslint](https://github.com/eslint/eslint): 通过`eslint`检查`js es6`的语法错误和一致性习惯，这里用到了[eslint-config-airbnb-base](https://github.com/airbnb/javascript)，也就是用了`airbnb`总结的代码书写习惯，这样对书写代码的一致性有了一个规范，特别是多人开发的时候，如果没有一个规范，那么每个人按照自己的习惯去做，那么代码会很难读懂和维护。可以在代码编辑器中，加入eslint插件，这样在开发的过程中，就可以时时的提示问题。如果对某些eslint规则不爽，可以通过配置`.eslintrc`去设置规则。`eslint`的一个好处，就是可以自定义规则。可以通过`npm run lint`来运行代码检查。
- `.editorconfig`: 请将代码编辑器配置支持[EditConfig](http://editorconfig.org/)的插件。编辑器通过读取这个配置文件之后，会按照一致的方式来书写代码，比如Tab键代表几个空格等，这样在多人开发，不同的开发环境，书写的代码是一致的。可以通过修改`.editorconfig`来进行一致性设置。
- `.tern-project`: 是本人使用vim编辑器的syntastic插件的js下错误检测配置。如果不用vim可以不用管它或者删除。

## 自动化及持续集成
可以使用`gitlab`和`jenkins`配置版本控制和自动化测试，构建和部署。而`gitlab`和`jenkins`同样可以通过docker方便的搭建。

## 本例的镜像
在本例中通过Dockerfile，生成了hahoo/node-hello的测试镜像，存储在Docker官方的Hub仓库[https://hub.docker.com/r/hahoo/node-hello/](https://hub.docker.com/r/hahoo/node-hello/)。在Docker的hub仓库中，设置了github的自动化构建，当提交到github中，会自动按照配置构建镜像。您可以用本例的镜像进行测试。

拉取镜像
```
docker pull hahoo/node-hello
```
或直接生成容器
```
docker run -p 8080:8080 -d --name node-hello hahoo/node-hello
```

## 常见问题
#### 用docker部署服务，可行吗？
答: 当然，以往的部署是在服务器中建立环境，比如数据库等，然后部署上去。这相当于服务和服务器耦合了，如果一个主机有多个服务，不同的数据库，就要建立很多环境，如果涉及不同的版本，将更难维护，特别是在服务器迁移的时候，还要去服务器安装配置等，特别是本地开发的服务，发到服务器上发现跑不起来，而服务器维护人员无法独自排查原因，而又不允许开发人员直接到生产服务器上操作排查。而通过容器技术，实现了应用服务和服务器的解耦，可以实现快速的部署和迁移，可以实现从开发到生产的环境一致性，也方便集群和扩展。对于云服务和微服务，很适合容器。而且现在已经不用担心这个能不能用到生产的问题，因为各大互联网公司已经在使用Docker在跑服务了。

#### 服务器用什么操作系统？
答: 用支持docker的linux内核版本即可，比如CentOS 7。当然，也可以使用CoreOS，只跑容器的Linux OS，而且特别容易实现集群等新云服特性。

#### 服务器全用Docker部署吗？
答: 只要ssh远程连接，其它服务，都可以用Docker容器实现，比如nginx等等。

#### 一个服务器跑多个容器，性能？
答: Docker这种容器服务，不像VMware这种虚拟技术，docker可以动态的分配资源，可以在一个服务器中跑很多容器，当然也要看某一个容器服务的负载情况，更多请去搜索Docker技术的说明。

#### 为什么使用docker-componse
答: docker-componse 可以将一个应用项目涉及的服务容器整合在一起，通过一个配置文件即可启动和部署，很方便，相当于docker的批量操作。

#### 为什么要联合其它容器，通过一个linux镜像，将node,redis,postgre安装进去不行吗？
答: 可以这样，这样的确可以更方便的发布和部署。这样的弊端，就是要一直要维护这个镜像，比如postgre版本升级了，就要去镜像中更新，而且如果操作不擅，将会让整个镜像越来越大，越来越臃肿，所以不建议这种方式。而分开的方式，各自的服务镜像由官方维护，只要替换镜像版本即可实现升级。gitlab的官方镜像，就采用了全部封装到一个镜像里的方式发布，对于这种复杂配置的服务，这的确省事很多，只要run，就可以建立一个像github一样的服务，在以往，在服务器中安装一套gitlab，要经过很多步骤和设置。

#### 配置文件里`npm config set registry https://registry.npm.taobao.org`什么意思
答: 使用taobao的npm镜像，在国内安装node模块时，快很多。如果服务器在国外，可以不用这个。

#### 拉取官方镜像的时候很慢或者连接出错怎么办？
答: 请使用国内的加速器。比如阿里云加速器。[https://cr.console.aliyun.com/#/accelerator](https://cr.console.aliyun.com/#/accelerator), 具体配置请自行搜索一下。

#### 为什么生产环境，把代码都放到了镜像里
答: 开发环境，可以把开发目录作数据卷全部挂载到容器里，这样方便开发调试。生产环境，最好是把代码和npm安装的模块都放到镜像里，只把其它永久存储的数据作为数据卷挂载。通过升级镜像，来升级服务。推荐这样。当然，你也可以把代码文件作为镜像挂载进去，这样每次修改文件即可更新，不过可能很多操作还是要到容器里面操作，比如npm安装。通过封装到镜像的方式升级，还可以通过版本记录变化，可以方便的回滚到以往的版本。

#### 开发环境，一定要用容器里的node来调试吗？
答: 可以不用。本地安装了node环境，可以直接开发调试，这个脚手架就考虑了这个问题，所以架构上可以脱离docker容器开发，所以有个初始化过程，把`node_modules`文件夹放到根目录，就像以前没用docker容器一样的目录结构。不过数据库等最好还是用容器吧，这不是方便很多？不用安装数据库到本机了。不过还是推荐使用容器的方式，起码要用容器调试，这样在发布到生产前解决遇到的问题。

#### 为什么使用alpine版本镜像
答: alpine是个只有几M的linux版，构建的镜像比较小。常见应用的官方镜像基本都发布了alpine版。如果要自己不得不定义一些服务镜像，也建议使用alpine作为基础镜像去搭建。

#### 怎么进入alpine镜像建立的容器里
答: alpine没用使用bash，所以进入alpine镜像，类似于这样：`docker exec -it xxxxxx /bin/ash` 是`ash`不是`bash`

#### 我的容器要开ssh端口给远程访问维护吗？
答：当然你可以这么做，但是最好不要这样。按照以前的虚拟化技术，比如VMware，虚拟了一个系统，然后通过ssh连接服务来维护。而docker容器，要改变思路，把它作为服务发布的一种容器对待。当然一些场景，是需要ssh登录服务器操作的，那么不是不可以。

#### postgres的数据库密码是？
答: 在`docker-compose.yml`和`docker-compose.prod.yml`的`db`部分，通过环境变量`POSTGRES_PASSWORD`设置密码，初始设置的密码是`SgQ6Vhc3u015xOL09se9`，请设置成您自己的。

#### redis的密码是？
答: 在`config/redis/redis.conf`中的`requirepass`中设置，初始设置的密码是`CCq2Si39hdgY6ajP5vHL`，请设置成您自己的。
