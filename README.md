# BingoDB

Simple chemical structure database.

## Build dependencies

- Java 1.8
- Maven 3.1+

## Build procedure

Configure folder for storing files and security properties in `src/main/resources/application.properties`

Execute `mvn spring-boot:run` to start BingoDB in development mode.

Execute `mvn clean package -P release` to create production `.war` file.

## Maven profiles

- `dev` - for development use only, activated by default
- `release` - for production use (`mvn clean package -P release`)

See [Spring Boot docs](http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/) for configuration and installation options

## Docker image

Execute `docker:build` (`mvn clean package docker:build -P release`)

`Dockerfile` will be placed into `target/docker`

Example run:
 
`docker run -p 9999:9999 -v c:/bingodb/data:/bingo bingodb`

`-v` is necessary to specify BingoDB storage folder in the host system.

See Docker options for details.

## Code Style

You should check your code with `CheckStyle` and `FindBugs` maven plugins executing `mvn clean compile` command. 
