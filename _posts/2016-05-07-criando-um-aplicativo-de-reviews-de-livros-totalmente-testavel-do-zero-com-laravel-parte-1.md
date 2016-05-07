---
layout: post
title: "Criando um aplicativo de reviews de livros totalmente testável do zero com Laravel - parte 1"
date: 2016-05-07 05:11:17
image: '/assets/img/posts/testing-1-en.png'
description: "Primeiro post de uma série sobre como criar uma API RESTFul totalmente testável."
tags:
- php
- tdd
- laravel
categories:
- php
- testing
- laravel
twitter_text:
---


# Indíce
- [Setup básico](#setup)
- [Como TDD funciona](#tdd)
- [Escrevendo nosso primeiro teste](#test)
- [Recebendo nosso primeiro erro](#test)
- [Configurando o Travis CI](#travis)  

Nessa série vamos criar uma API RESTful totalmente testável que servirá um aplicativo criado usando Ionic. O app terá apenas um propósito: avaliar livros. Nós iremos falar desde o desenvolvimento até o deploy de tanto nossa API quanto de nosso app.  

A primeira coisa que vamos fazer é criar um novo projeto com o Laravel. Você pode ver como fazer isso [aqui](https://laravel.com/docs/5.2/installation). Eu também irei usar a máquina virtual Homestead para desenvolver nossa API — é muito fácil de instalar. Dê uma olhada [nisso](https://laravel.com/docs/5.2/homestead).  


# Setup Básico  

Agora vamos escrever código. A primeira coisa que eu irei fazer é configurar um arquivo `.env` — algo assim:  

```  

APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:FaFQysRPBTvIwMhaYMgGcXG5T8x8Wd2cj64dzGtDdX8=
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=192.168.10.10
DB_PORT=3306
DB_DATABASE=bookapp
DB_USERNAME=homestead
DB_PASSWORD=secret

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_DRIVER=smtp
MAIL_HOST=mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null

```  

Isso está configurado para usar um banco de dados MySQL (ou MariaDB, eu uso MariaDB) que já vem com o Laravel Homestead. Nós não iremos usar isso por enquanto, portanto apenas esqueça este arquivo.  

Agora vamos configurar nosso ambiente de testes. Isso é particularmente importante porque será usado toda vez que rodarmos nossos testes e no nosso serviço de Integração Contínua (falaremos disso em alguns minutos). Para isso, abra o arquivo `phpunit.xml`. Você verá algo assim:  

```xml  

<?xml version="1.0" encoding="UTF-8"?>
<phpunit backupGlobals="false"
         backupStaticAttributes="false"
         bootstrap="bootstrap/autoload.php"
         colors="true"
         convertErrorsToExceptions="true"
         convertNoticesToExceptions="true"
         convertWarningsToExceptions="true"
         processIsolation="false"
         stopOnFailure="false">
    <testsuites>
        <testsuite name="Application Test Suite">
            <directory suffix="Test.php">./tests</directory>
        </testsuite>
    </testsuites>
    <filter>
        <whitelist processUncoveredFilesFromWhitelist="true">
            <directory suffix=".php">./app</directory>
            <exclude>
                <file>./app/Http/routes.php</file>
            </exclude>
        </whitelist>
    </filter>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="CACHE_DRIVER" value="array"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="QUEUE_DRIVER" value="sync"/>
    </php>
</phpunit>

```  

Nós devemos configurar variáveis de ambiente que serão usadas apenas em testes. Para fazer isso, precisamos apenas adicionar algumas novas tags `env`. Precisamos fazer duas coisas: rodar nossos testes usando SQLite e rodá-los na memória — isso é importante porque não queremos usar um banco de dados real. Para fazer isso, adicione as variáveis `DB_DATABASE` e `DB_CONNECTION`. Assim:  

```xml  
<?xml version="1.0" encoding="UTF-8"?>
<phpunit backupGlobals="false"
         backupStaticAttributes="false"
         bootstrap="bootstrap/autoload.php"
         colors="true"
         convertErrorsToExceptions="true"
         convertNoticesToExceptions="true"
         convertWarningsToExceptions="true"
         processIsolation="false"
         stopOnFailure="false">
    <testsuites>
        <testsuite name="Application Test Suite">
            <directory suffix="Test.php">./tests</directory>
        </testsuite>
    </testsuites>
    <filter>
        <whitelist processUncoveredFilesFromWhitelist="true">
            <directory suffix=".php">./app</directory>
            <exclude>
                <file>./app/Http/routes.php</file>
            </exclude>
        </whitelist>
    </filter>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="CACHE_DRIVER" value="array"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="QUEUE_DRIVER" value="sync"/>
        <env name="DB_CONNECTION" value="sqlite" />
        <env name="DB_DATABASE" value=":memory:" />
    </php>
</phpunit>
```    

Agora, vamos pensar um pouco — do que o nosso app **realmente** precisa? Bom, ele precisa de uma tabela `reviews`, certo? Também seria legal ter uma tabela chamada `books` para guardarmos alguns livros e seus autores. Vamos começar criando a tabela `books`. Rode o comando `php artisan make:model Book -m` — esse comando cria um model chamado `Book` e a flag `-m` cria uma `migration` para esse model.  

Agora, vamos configurar nossa migration. Vá para o arquivo recém-criado e adicione um campo `string` title e `string` author. O último deve ser `nullable`. Assim:  

```php 

<?php 

public function up()
{
    Schema::create('books', function (Blueprint $table) {
        $table->increments('id');
        $table->string('name');
        $table->string('author')->nullable();
        $table->timestamps();
    });
}

?>

```  

Também é necessário criar a migration da tabela `reviews`. Essa tabela deve ter os seguintes campos: `string` title, `text` description, `text` additional_information, `integer` note, `integer` user_id (uma referência à nossa tabela de usuários) e `integer` book_id (referência a um livro).  

Algo assim:  

```php  
<?php

public function up()
{
    Schema::create('reviews', function (Blueprint $table) {
        $table->increments('id');
        $table->string('title');
        $table->text('description');
        $table->text('additional_information')->nullable();
        $table->integer('note');
        $table->integer('user_id')->unsigned();
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        $table->integer('book_id')->unsigned();
        $table->foreign('book_id')->references('id')->on('books')->onDelete('cascade');
        $table->timestamps();
    });
}

?>
```
 
Agora que temos nossos models configurados, nós nem precisamos rodar o comando `php artisan migrate` — isso será feito automaticamente nos testes.  

<a name="tdd"></a>

# Como TDD funciona  

Test-Driven Development é uma metodologia que funciona basicamente assim:  escreva um teste para uma funcionalidade — ele irá falhar. Agora, implemente essa funcionalidade, faça o teste passar, e depois refatore o código. Isso melhora a qualidade do seu código por diversas razões: nós fazemos algo com um objetivo "definido", nós seguimos padrões e refatoramos o código constantemente.  

<a name="test"></a>  

# Escrevendo Nosso Primeiro Teste  

Agora é que a diversão começa! Nós vamos escrever um teste simples que verifica se livros podem ser criados e coisas do tipo. Para fazer isso, rode o comando `php artisan make:test Unit/BookTest`. Um arquivo deve ser criado em `tests/Unit/BookTest.php`, e você deve receber um `Test created successfully` no seu Terminal.  

Ao abrir o arquivo, você perceberá que ele vem com um método chamado `testExample`. Ele apenas faz uma asserção de que `true` é verdadeiro — e, como é , o teste passa. O PHPUnit tem vários métodos de asserções e nós iremos usá-los constantemente durante a série.  

Você pode deletar esse método. Agora, crie um método chamado `testABookCanBeCreated`. Você também pode usar underscore ao invés de camelCase — eu prefiro usar underscore. Então o nome deve ser `test_a_book_can_be_created`.  

Nesse método, nós queremos ter certeza que um livro **pode** ser criado. Para isso, nós iremos fazer o seguinte:  

- Criar um livro
- Buscar o último livro
- Ter certeza que o livro encontrado tem os atributos corretos
- Ter certeza de que conseguimos achar esse registro no banco de dados  

Você provavelmente já sabe como criar e encontrar livros usando os métodos do Eloquent. No entanto, existem outros dois métodos importantes do PHPUnit que iremos usar: `assertEquals` e `seeInDatabase`. `assertEquals` basicamente faz uma asserção de que alguma coisa é igual à outra, `seeInDatabase` verifica se um array de valores pode ser encontrado numa tabela.  
Nosso arquivo deve ficar mais ou menos assim:  

```php  
<?php

use App\Book;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class BookTest extends TestCase
{
    use DatabaseMigrations;

    public function test_a_book_can_be_created()
    {
        $book = Book::create(['name' => 'The Hobbit', 'author' => 'J.R.R Tolkien']);

        $latest_book = Book::latest()->first();

        $this->assertEquals($book->id, $latest_book->id);
        $this->assertEquals('The Hobbit', $latest_book->name);
        $this->assertEquals('J.R.R Tolkien', $latest_book->author);

        $this->seeInDatabase('books', ['id' => 1, 'name' => 'The Hobbit', 'author' => 'J.R.R Tolkien']);

    }
}


```  

Note que importamos duas classes: `Book`, nossa entidade, e `DatabaseMigrations`, um trait que iremos usar para que as migrations rodem antes de qualquer teste. Portanto, não esqueca de usá-la.  

O método `assertEquals` é bem simples, ele aceita dois argumentos (alguns outros não importantes) e simplesmente checa se eles são iguais. Se não forem, o teste **irá** falhar. O método `seeInDatabase` aceita uma tabela como primeiro argumento e um array de valores no segundo. Nesse caso, procuraremos na tabela `books` por um registro com `['id' => 1, 'name' => 'The Hobbit', 'author' => 'J.R.R Tolkien']`.  

<a name="error"></a>  

# Recebendo nosso primeiro erro  

Agora, rode `phpunit` no seu Terminal — você notará que o teste falhará. Você deve receber algo assim:  

```sh  
PHPUnit 4.8.24 by Sebastian Bergmann and contributors.

.E

Time: 400 ms, Memory: 12.00Mb

There was 1 error:

1) BookTest::test_a_book_can_be_created
Illuminate\Database\Eloquent\MassAssignmentException: name

/Users/mateus1/Dev/aulas/api-tests-post/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:449
/Users/mateus1/Dev/aulas/api-tests-post/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:281
/Users/mateus1/Dev/aulas/api-tests-post/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:569
/Users/mateus1/Dev/aulas/api-tests-post/tests/Unit/BookTest.php:13
phar:///usr/local/Cellar/phpunit/4.5.0/libexec/phpunit-4.5.0.phar/phpunit/TextUI/Command.php:152
phar:///usr/local/Cellar/phpunit/4.5.0/libexec/phpunit-4.5.0.phar/phpunit/TextUI/Command.php:104

FAILURES!
Tests: 2, Assertions: 2, Errors: 1.
```    

Bom, recebemos um erro.. isso é, na verdade, bom. Nossos testes nos guiarão ao erro e iremos corrigí-lo. Note que a `Exception` recebida foi `MassAssignmentException: name` — isso ocorreu porque tentamos usar o método `create` (Mass Assignment) sem preencher a propriedade `$fillable`. Então, vamos configurar isso. Vá ao arquivo `app/Book.php` e crie um array `$fillable` com os campos que podem ser preenchidos.  



```php  
<?php
// app/Book.php  

namespace App;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = ['name', 'author'];
}

```  

Agora, rode o comando `phpunit` novamente. Você deve receber isso:  


```sh   
PHPUnit 4.8.24 by Sebastian Bergmann and contributors.

..

Time: 382 ms, Memory: 12.00Mb

OK (2 tests, 6 assertions)  
```  

Agora o teste está passando!   
Você talvez tenha notado que o PHPUnit nos diz que existem dois testes — isso ocorre porque eu ainda não removi o teste `ExampleTest`. Você pode deletá-lo sem problemas. Nas próximas etapas, nós vamos configurar o Travis CI e no post seguinte iremos de fato testar nossa API.  

<a name="travis"></a>  

# Configurando o Travis CI  
Travis CI é um servico de integracão contínua. Ele basicamente configura uma máquina virtual com softwares que você queria (PHP, Ruby, Node, etc) e roda comandos que você define. Ele irá rodar os comandos toda vez que você "enviar" código para o seu repositório Git. O Travis é **pago** para projetos privados. Se você está escrevendo um projeto open source, entre em [travis-ci.org](https://travis-ci.org). Se você está escrevendo projetos **pessoais**, acesse [travis-ci.com](https://travis-ci.com). Eles ofereem licenca de estudante, que eu, por exemplo, uso. Obrigado Travis! :)  

Então comecaremos escrevendo um arquivo `.env.travis`. Ele será usado ao rodar testes no Travis. Apenas escreva algo assim:  


```
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:FaFQysRPBTvIwMhaYMgGcXG5T8x8Wd2cj6

DB_HOST=127.0.0.1
DB_DATABASE=book_test
DB_USERNAME=travis
DB_PASSWORD=

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync

MAIL_DRIVER=smtp
MAIL_HOST=mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```  

Agora crie um arquivo chamado `.travis.yml` e coloque isso nele:  


```yml

language: php

php:
  - 7.0

before_script:
  - composer self-update
  - composer install
  - mysql -e 'create database book_test;'
  - cp .env.travis .env
  - php artisan key:generate
  - php artisan migrate

script: phpunit

```  

Nós estamos dizendo o seguinte para o Travis:  


- Configure um ambiente com PHP
- Use PHP 7.0 (você pode especificar mais de uma versão)
- Antes de rodar nosso script, atualize o composer, rode `composer install`, crie um banco MySQL chamado `book_test`, copie o conteúdo de `.env.travis` para `.env` e depois rode alguns comandos do Laravel.
- Assim que tudo isso acontecer, rode `phpunit`.  

Basicamente, isso é Integração Contínua. Toda vez que dermos um `git push`, o Travis irá rodar nossos testes automaticamente. :)