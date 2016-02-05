---
layout: post
title: "Repository Pattern on Laravel — Implementing an Interface (Part 2)"
date: 2016-02-05 03:30:26
image: '/assets/img/posts/repository-pattern-on-laravel-part-2.png'
description: 'This post talks about how to implement an interface in a class with Laravel.'
tags: 
- php
- laravel
- patterns
categories:
- php
- laravel
twitter_text:
---

**Attention: if you haven't already seen the first part of this post, please take a look at it.** [Repository Pattern on Laravel (Part 1)](/repository-pattern-on-laravel).


In the previous post about repositories I talked about how to create an abstraction layer between the controller and the database. We used the following examples: `app/Http/Controllers/PostsController.php` and `app/Repositories/PostRepository.php`- to see the codes, just click the link in the top of this post.  
I showed how to inject the `PostRepository` class - the one responsible for making the calls to our `model` - in our `PostsController`. That helped us have more control about our queries, etc. However, it doesn't give us, for instance, flexibility when changing ORMs. To do that, we need to implement an `Interface` — something that works as a contract to the `Class`. It basically tells the class which methods it should implement without defining how those methods should be treated, [click here to learn more](http://php.net/manual/pt_BR/language.oop5.interfaces.php) —, then, we need to make Laravel know which class to use whenever this `Interface` is implemented and then we simply need to inject it in the `controller`. This way, we can make modifications without having to change anything in the controller. To do that, let's first create our Interface. You may put your file wherever you want, I'll put it on `app/Repositories/Contracts'.  

```php
<?php
// app/Repositories/Contracts/PostRepositoryInterface.php

namespace App\Repositories\Contacts;

interface PostRepositoryInterface
{
    public function find();

    public function findBy($att, $column);
}

?>
```    

Fairly simple: we are simply telling what methods any class that implements `PostRepositoryInterface` shall have - it **needs** to have these methods, or it'll throw an exception.  

Now, we need to implement this interface in our `PostRepository`. Our old code was something like this:  

```php
<?php
// app/Repositories/PostRepository.php
namespace App\Repositories;

use App\Post;

class PostRepository
{
        protected $post;
        
        public function __construct(Post $post)
        {
                $this->post = $post;
        }
        
        public function find($id)
        {
                return $this->post->find($id);
        }
        
        public function findBy($att, $column)
        {
                return $this->post->where($att, $column)
        }
}
?>

```    

To implement our `PostRepositoryInterface`, we simply need to use the operator `implements` in the class declaration. We also have to import the Interface. It should look like this:  

```php
<?php
// app/Repositories/PostRepository.php
namespace App\Repositories;

use App\Repositories\Contracts\PostRepositoryInterface;
use App\Post;

class PostRepository implements PostRepositoryInterface
{
        protected $post;
        
        public function __construct(Post $post)
        {
                $this->post = $post;
        }
        
        public function find($id)
        {
                return $this->post->find($id);
        }
        
        public function findBy($att, $column)
        {
                return $this->post->where($att, $column)
        }
}
?>

```    

Very simple! Now, If you'd want, you could create another repository — using Doctrine, perhaps — and call it, I don't know, `PostRepositoryDoctrine` and we'll have also too implement our interface. This way, we would have two (or more) classes (repositories) that implement the same `PostRepositoryInterface`. But how is our controller going to know which class (repository) it should inject? Simple: **it doesn't know.** Instead of injecting our repository directly in our controller constructor, we're going to inject our `PostRepositoryInterface` and then we'll use [Laravel's Service Container](https://laravel.com/docs/5.1/container) to decide which repository (class) use — or, even better, make the binding between the interface and the class that should be used. So, first, let's set this up. To do that, open the file `app/Providers/AppServiceProvider.php`. In the `register` method, we're going to bind our interface to our correct repository using the `bind` method. Kinda like this:  

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('App\Repositories\Contracts\PostRepositoryInterface', 'App\Repositories\PostRepository');
    }
}
?>
```   

We basically told Laravel that, whenever a class needs the `PostRepositoryInterface` interface, it should inject the `PostRepository` class. Obviously, we also wrote the namespace of each class.  

Now, back to our `PostController` — we're going to put our `PostRepositoryInterface` in our class constructor and then Laravel will "decide" (just as we configured in `AppServiceProvider`) which class to inject, in our case, `PostRepository`.  

```php
<?php
// app/Http/Controllers/PostsController.php
namespace App\Http\Controllers;

// antigamente: use App\Repositories\PostRepository; agora não precisamos mais disso pois já definimos qual classe injetar quando necessitarmos da interface PostRepositoryInterface. Iremos importá-la e colocá-la no construtor - repare nas linhas 8 e 13
use App\Repositories\Contracts\PostRepositoryInterface;

class PostsController
{
        protected $post;

        public function __construct(PostRepositoryInterface $post)
        {
        	$this->post = $post;
        }

        public function show($slug)
        {
        	return $this->post->findBy('slug', $slug);
        }
}
?>
```  

In the end, you end up returning an `Eloquent Collection`, so even if you were going to change your ORM (Doctrine, again, as an example), you'd still have to fix the methods, as you would be returning an `array` instead of an `Eloquent Collection`, you could "fix" this by working with arrays everytime, even with Eloquent, but then you'd lose all of it's magic, wouldn't you? Some would call this overengineering and I consider it too.  
Just as I explained in the previous post, repositories end up being a way to organize your code — at least for those who use Eloquent. If you're really interested in using Repositories "the right way" (even when you probably won't ever stop using Eloquent), it is better to take a look at something like Doctrine.  
I sincerely hope I helped anyone. Any doubts, please leave a commentary. If I said something wrong, it would be nice to correct me.  Thanks!