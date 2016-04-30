---
layout: post
title: "Creating a fully-testable books review app from the ground with Laravel - Part 1"
date: 2016-04-30 19:11:04
image: '/assets/img/posts/testing-1-en.png'
description: "First post of a series about how to create a fully-testable RESTFul API and a mobile app that it will serve."
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

# Index
- [Basic Setup](#setup)
- [How TDD Works](#tdd)
- [Writing Our First Test](#test)
- [Getting Our First Error](#error)
- [Setting Up Travis CI](#travis)

In this series we're going to create a fully testable RESTful API that will serve an Ionic mobile app. The app has only one purpose: books reviews. We're going to cover from development to deployment of both our API and the app.  


The first thing we're going to do is create a new Laravel 5.2 project. You can see how to do it [here](https://laravel.com/docs/5.2/installation). I'll also be using a Homestead virtual machine to develop our API — it is very simple to install. Take a look at [this](https://laravel.com/docs/5.2/homestead).  



# Basic Setup

So, now let's code. The first thing I'm going to do is to set up a basic `.env` file — something like this:  

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

This is set up to use a MySQL (or MariaDB, I'm using MariaDB) database that ships with Laravel Homestead. We won't really be using this for a while, so just forget this file.  

Now let's set up our test environment. This is particularly important because it's going to be used whenever we run tests and also in our Continuous Integration service (we're going to set this up in a few minutes). To do this, go to your `phpunit.xml` file. You'll see something like this:  

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

We want to set environment variables that are going to be used only in tests. To do that, we just need to add some new `env` tags. We want two things: to run the tests using SQLite and to run them in `memory` — the latter one is very important because we don't want to use a real database, we just run to store everything in memory.  To do that, just add a `DB_DATABASE` and a `DB_CONNECTION` variables. It should look like that:  

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

Now, let's think a bit — what does our app **really** needs? Well, it needs a `reviews` table, right? It would also be nice to have a `books` table so we can store some books and their authors. So, let's start by creating the `books` table. Run `php artisan make:model Book -m` - this command creates a model called `Book` and the `-m` flag creates a migration to that model.  

Now, let's set our migration up. Go to the newly created file and add a `string` title and `string` author field. The latter one should be `nullable`. It should look like this:  

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

You also need to create the `reviews` migration. That table should have a `string` title, `text` description, `text` additional_information, `integer` note, `integer` user_id (that's a reference to our users table) and a `integer` book_id (a reference to the book).  

Something like this:  

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

Now that we have our models set up, we don't even need to run `php artisan migrate` — this is going to be done at the tests.  

<a name="tdd"></a>  

# How TDD Works  

Test-Driven Development is a methodology that is basically "write a test, it shall fail, implement that feature, make the test pass and then refactor your code". It improves our code quality for several reasons: we make something with a "defined" objective, we follow patterns and we refactor it constantly.

<a name="test"></a>  

# Writing Our First Test  

Now the fun begins! We're going to write a simple test that makes sure books can be created and stuff like that. To do this, run the `php artisan make:test Unit/BookTest`. A file should be created at `tests/Unit/BookTest.php`. And you should receive a `Test created successfully.` message in your terminal.  

Once you open the file, you'll notice it comes with a `testExample` method. That just makes an assertion that `true` is true — and, as it is, this test will pass. PHPUnit has a lot of assertion methods and we're going to use them constantly during this series.  

You can safely delete this `testExample` method. Now, create a `testABookCanBeCreated`. You can also use underscore instead of camelCase — I actually prefer to do this. So it should be `test_a_book_can_be_created`.  

In this method, we want to make sure a book **can** be created. To do this, we're going to the following things:  

- Create a Book
- Fetch the latest book
- Make sure the fetched book has the attributes it should have
- Make sure we can see this record in the database  

You probably already know how to create and fetch a book using Eloquent's methods. However, there are two important PHPUnit's methods we're going to use: `assertEquals` and `seeInDatabase`. `assertEquals` basically asserts something is equal to another thing, `seeInDatabase` makes sure an array of values can be seen in a particular table.  Here's how our file should look:  

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

Notice that we import two important classes: `Book`, our entity, and `DatabaseMigrations`, a trait we're going to use so migrations run before every test! So, don't forget to use it.  

The `assertEquals` method is fairly simple, it accepts two main arguments (some other too, but they're not relevant) and simply checks if they are equals. If they are not, your test **will** fail.  The `seeInDatabase` methods accepts a table and an array of values it should look for. In this case, we're looking in the `books` table for a record with `'id' => 1`, `'name' => 'The Hobbit'`, `'author' => 'J.R.R Tolkien'`.  

<a name="error"></a>  

# Getting our first error

Now run `phpunit` on your Terminal — you'll notice it fails. You should receive something like that:  

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

So, yeah... we got an error. That's actually good. Our tests are going to lead us to the error and we're going to fix it. Notice the exception that was thrown: `MassAssignmentException: name` — that's because we're trying to use the `create` method without setting up the `$fillable` property. So, let's set it up. Go to your `app/Book.php` file and create a `$fillable` array with the fields that should be allowed to be filled.  

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

Now run `phpunit` again. You should receive this:  

```sh   
PHPUnit 4.8.24 by Sebastian Bergmann and contributors.

..

Time: 382 ms, Memory: 12.00Mb

OK (2 tests, 6 assertions)  
```

Your test is green! It is passing! wooho! And we just made our first test pass. :)  
You may notice that PHPUnit tells me I have 2 tests — that's because I have not yet removed the `ExampleTest` test. You can safely delete it.  In the next steps we're going to set up Travis CI and in the following post we're going to actually test our RESTFul API. :)  

<a name="travis"></a>  

## Setting up Travis CI  
Travis CI is a Continuous Delivery service. It basically set up a virtual machine with the software you want (PHP, Ruby, Node, etc) and run commands you define. It will run whatever commands you want to everytime you push code to your Git repository. Travis CI is **paid** for personal projects. If you're writing open source, go to [travis-ci.org](https://travis-ci.org). If you're writing **personal** projects, go to [travis-ci.com](https://travis-ci.com). They have a student license, which I gladly use. Thanks Travis! :)  

So, we'll start by creating a `.env.travis` file. This file is going to be used when running tests in Travis. Just put something like this:  

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

Now create a file `.travis.yml` and put this on it:  

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

We're basically telling Travis this:  
- Set up a PHP environment
- Use PHP 7.0 (you can specify multiple versions)
- Before running our script, update composer, run `composer install`, create a `book_test` mysql database, copy `.env.travis` to `.env` and then run some artisan commands.
- When this is done, run `phpunit`.  

So yeah, that's what CI is all about. Whenever we push some code, Travis is going to run our tests automatically. :)  

