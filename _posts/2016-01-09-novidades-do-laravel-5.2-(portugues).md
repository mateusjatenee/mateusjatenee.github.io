---
layout: post
title: "Novidades do Laravel 5.2 (Português)"
date: 2016-01-09 04:59:46
image: '/assets/img/posts/novidades-do-laravel-52.png'
description:
tags:
- php
- laravel
- news
categories:
- php
- laravel
twitter_text:
---

# Índice
- [Múltiplos drivers de autenticação](#auth)  
- [Scaffolding da autenticação](#scaffold)  
- [Implicit Model Binding](#modelbinding)  
- [Grupos de Middlewares](#middlewares)  
- [Rate Limiting](#ratelimiting)  
- [Validação de Arrays em formulários](#arrayvalidation)

# Múltiplos drivers de autenticação <a name="auth"></a>
Agora você pode usar os métodos ```Auth``` para autenticar usuários com base em diferentes tabelas. Post explicando como usar essa funcionalidade em breve.

# Scaffolding da autenticação <a name="scaffold"></a>
Agora, usando o comando ```php artisan make:auth``` o próprio Laravel gera todas as views de login, cadastro, recuperação de senha, etc. As seguintes views são geradas (dentro do diretório ```resources/views```):  
```auth/login.blade.php```  
```auth/register.blade.php```  
```auth/passwords/email.blade.php```  
```auth/passwords/reset.blade.php```  
```auth/emails/password.blade.php```  
```layouts/app.blade.php```  
```home.blade.php```  
```welcome.blade.php```  
Todas as views estendem a view ```layouts/app.blade.php```, que obviamente serve de layout.   
Além disso, ele também gera um controller chamado ```HomeController``` já com o middleware ```auth```:  


```php
<?php
// app/Http/Controllers/HomeController.php

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard. // mostra o painel da aplicação
     *
     * @return Response
     */
    public function index()
    {
        return view('home');
    }
}
?>
```  

E, além de tudo isso, também gera as rotas!  

```php
<?php

Route::get('/', function () {
    return view('welcome');
});


Route::group(['middleware' => ['web']], function () {
    //
});

Route::group(['middleware' => 'web'], function () {
    Route::auth();

    Route::get('/home', 'HomeController@index');
});

?>
```

Ele gera as rotas de autenticação com o método ```Route::auth()``` e também uma rota para o dashboard da aplicação, tudo isso dentro de um grupo de rotas ```Route::group``` com o [grupo de middlewares](#middlewares) `web`,  

# Implicit Model Binding  <a name="modelbinding"></a>
O Laravel já tinha **[Route Model Binding](https://laravel.com/docs/5.1/routing#route-model-binding)** há algum tempo - ele nos permite injetar dependências nas rotas. Exemplo da documentação do Laravel:  

```php
<?php
// app/Providers/RouteServiceProvider.php

public function boot(Router $router)
{
    parent::boot($router);

    $router->model('user', 'App\User');
}
?>
```


e a rota:  


```php
<?php
Route::get('profile/{user}', function($user) {
    //
});
?>
```

O que acontece é o seguinte: no primeiro arquivo, nós atribuímos o model `User` ao parâmetro de rota `{user}`. No segundo arquivo, usamos o parâmetro `{user}` numa rota. Como já atribuímos um model a esse parâmetro, o Laravel automaticamente injeta uma instância de `User` à essa rota. Ou seja, se fizermos uma requisição à URL `profile/10`, o Laravel automaticamente injetará uma instância da classe `User` que contém ID 10. Basicamente, enquanto antes você retornaria algo como `User::findOrFail($user)`, para achar um usuário com o ID `$user`, agora basta você retornar `$user`.  

Bom, agora falaremos de **Implicit Model Binding**. Com o Laravel 5.2, você pode fazer isso:  


```php
<?php

Route::get('profile/{user}', function(App\User $user) {
    return $user;
)};

?>
```

Nós apenas injetamos o model `User` numa váriavel de nome igual ao parâmetro da rota - ambos tem o nome `user`. Dessa forma, não precisamos mexer em nada do `RouteServiceProvider` e temos todos os benefícios do Route Model Binding. Se fizéssemos uma requisição à URL `profile/10`, também retornaria o usuário de ID 10.

# Grupos de Middlewares <a name="middlewares"></a>
Basicamente nos permite agrupar diversos middlewares em um só (pode-se chamar de um "alias", eu acho).  
Se abrirmos o arquivo `app\Http\Kernel.php`, veremos que já existem dois grupos por padrão. Temos o seguinte `array`:  


```php
<?php

protected $middlewareGroups = [
    'web' => [
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\VerifyCsrfToken::class,
    ],

    'api' => [
        'throttle:60,1',
    ],
];

?>
```


Temos o primeiro grupo, `web`, que contém 5 middlewares: `EncryptCookies`, `AddQueuedCookiesToResponse`, `StartSession`, `ShareErrorsFromSession` e `VerifyCsrfToken`. No segundo grupo, `api`, temos apenas um [middleware de limites de requisições](#ratelimiting). Ou seja: ao invés de ter que usar X middlewares, basta usar um grupo que inclui todos eles. 

# Rate Limiting <a name="ratelimiting"></a>

O Laravel 5.2 trouxe um middleware muito legal que nos permite limitar o número de requisições para uma rota de um certo IP. Se você reparou bem, ele é utilizado no grupo de middlewares `api`. Ele funciona desse jeito:  


```php
<?php
Route::get('/api/users', ['middleware' => 'throttle:60,1', function () {
    //
}]);
?>
```

`throttle:60,1` significa que um IP pode realizar apenas 60 requisições em 1 minuto para essa rota. Para que um IP possa realizar apenas 10 requisições em 1 hora para essa rota, usaríamos `throttle:10,60`. 

# Validação de Arrays em formulários <a name="arrayvalidation"></a>

Antigamente, era meio chato validar arrays em formulários. Suponha que você tem os campos `user[0][name]`, `user[1][name]` e `user[2][name]`. Como você faria para validar esses campos? E se a quantidade de campos `user[name]` fosse dinâmica? Com o Laravel 5.2 é muito fácil.  


```php
<?php

$validator = Validator::make($request->all(), [
    'user.*.name' => 'required|max:40'
]);

?>
```
**Obs:** o caractére * é um wildcard. Isto é, ele significa qualquer coisa. Ou seja, no exemplo acima o * pode ser `[0]`, `[1]` ou `[1000]`.

É super simples: o nosso `Validator` vai validar o campo `user[*][name]`, onde o * é um wildcard e significa qualquer coisa. Ou seja, se seu formulário tiver inputs que vão de `user[0][name]` até `user[100][name]`, todos serão validados.



É isso. Qualquer sugestão, deixa nos comentários. Se eu cometi algum erro por favor avise também. :)


