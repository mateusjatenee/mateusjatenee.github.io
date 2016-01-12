---
layout: post
title: "Como injetar serviços em um template no Laravel (Português)"
date: 2016-01-12 01:06:50
image: '/assets/img/posts/como-injetar-servicos-em-um-template-no-laravel.png'
description: "Tutorial de como injetar serviços em um template no Laravel."
tags:
- php
- laravel
- blade
categories:
- php
- laravel
twitter_text:
---

Nesse post vou explicar como usar uma funcionalidade do Laravel 5.1 chamada [`service injection`](https://laravel.com/docs/5.2/blade#service-injection) (algo como injeção de serviços).  
Era bem comum ter uma view (partial) que era usada em outras views e que também usava informação guardada num banco de dados ou algo do tipo. Nesse caso, geralmente nós passávamos variáveis contendo esses dados para a view principal (no controller) e essa view continha um `@include` na partial. Desse jeito, nós tinhamos muito código duplicado (triplicado, quadruplicado...) já que sempre tínhamos que pegar os mesmos dados e passar para as views. Aqui vai um exemplo:  

A partial:

```html
{% raw %}
<div class="sponsors">
	<ul>
		@foreach($sponsors as $sponsor)
			<li>{{ $sponsor->name }}</li>
		@endforeach
	</ul>
</div>
{% endraw %}
``` 

Nesse caso, o objetivo é mostrar uma lista de patrocinadores do site. Essa lista varia e existe uma tabela com todos os patrocinadores - dessa forma, precisamos fazer uma requisição ao banco de dados. Nós geralmente faríamos da seguinte forma:  

```php
<?php
// app/Http/Controllers/PostController.php

public function show($id)
{
	$post = $this->post->find($id);
	$sponsors = $this->sponsorsService->getAllSponsors();

	return view('post.show', compact('post', 'sponsors'));
}

?>
```

Repare que nós tivemos que chamar o método `getAllSponsors()` que, nesse caso hipotético, faz uma requisição ao banco de dados para pegar todos os patrocinadores do site. Depois, passamos essa variável para a view `post/show` e ela passa para a `partial`. E aí fazemos a mesma coisa em outro controller, depois em outro, em outro... e aí temos muito código repetido. Ao invés disso, nós podemos injetar a classe `SponsorsService` diretamente na `partial`. Faríamos isso mais ou menos assim:  

```html
{% raw %}
<!-- sponsors partial -->
@inject('sponsors', 'App\Services\Sponsors')
<div class="sponsors">
	<ul>
		@foreach($sponsors->getAllSponsors() as $sponsor)
			<li>{{ $sponsor->name }}</li>
		@endforeach
	</ul>
</div>
{% endraw %}
``` 

Dê uma olhada. Ao invés de passar a variável `$sponsors` repetidas vezes, nós usamos a diretiva `@inject` para injetar a classe `SponsorsService` diretamente na `view`. A diretiva precisa de dois argumentos: o primeiro é o `nome` da variável e o segundo é a classe ou interface que iremos injetar.  
Dessa forma, não precisamos nos preocupar em ficar passando variáveis repetidas vezes, basta injetá-la diretamente na view :-). Cuidado para não abusar disso!  

Se gostou do post, compartilhe e deixe um comentário. :)