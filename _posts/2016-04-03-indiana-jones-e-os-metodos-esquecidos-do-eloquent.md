---
layout: post
title: "Indiana Jones e os métodos esquecidos do Eloquent"
date: 2016-04-03 01:17:58
image: '/assets/img/posts/indiana-jones-and-eloquents-forgotten-methods.png'
description: Post pequeno sobre alguns métodos do Eloquent.
tags:
- php
- eloquent
- laravel
categories:
- laravel
- php
- eloquent
twitter_text:
---

Existem vários métodos do Eloquent que sempre usamos: `find`, `findOrFail`, `create`, etc. O que muitas pessoas não sabem é que existem muitos outros métodos que geralmente não usamos. Falarei sobre alguns deles e como eles podem te ajudar.  

Para entender melhor, vamos trabalhar com uma tabela imaginária chamada `posts`, que possui as seguintes colunas: `INT id`, `VARCHAR title`, `TEXT content` e `created_at`e `updated_at`. [Eu criei um repositório no Github para caso você queira ver o código](https://github.com/mateusjatenee/indiana-jones-and-eloquents-forgotten-methods/). Eu também criei um seeder para termos alguns registros para trabalhar.  

## findMany  

Existe o famoso `find`, mas também existe o irmão dele: `findMany`. Enquanto o método `find` busca um registro específico pela sua chave primária (geralmente `id`), o `findMany` — como você imaginou — busca vários registros pelas suas chaves primárias. O método aceita um array de IDs (ou qualquer que seja sua chave primária) como primeiro e único parâmetro. Digamos que precisamos dos posts `1`, `2` e `3`. É assim que vamos conseguí-los:  

```php
<?php

public function getFirstSecondAndThirdPosts()
{
	$posts = Post::findMany(['1', '2', '3']);
	return $posts;
}
?>
```    

E é isso que recebemos:  

```json
[
{
id: 1,
title: "Velit velit fuga fugiat repudiandae tempore.",
content: "Est vel sapiente assumenda consectetur. Iusto corporis laudantium aspernatur hic quo iure corrupti. Eaque alias quos maiores perferendis. Dolor veniam distinctio mollitia exercitationem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:42:52"
},
{
id: 2,
title: "Eius facere quo est cupiditate.",
content: "Voluptatem recusandae molestiae sint. Ut at ut earum omnis sit totam. Sint hic voluptate autem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:42:52"
},
{
id: 3,
title: "Omnis sed delectus qui nemo atque.",
content: "Esse earum velit sed sapiente. Necessitatibus id esse alias nemo est repellendus sapiente. Pariatur sunt distinctio totam culpa similique. Rem sed quo doloremque debitis voluptatibus neque.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:42:52"
}
]
```  

Então é assim que conseguimos diversos registros pelas suas chaves primárias. :)  

## firstOrCreate  

Esse é bem legal. Você passa um array de atributos e o Eloquent tenta achar um registro que corresponda aos atributos. Se ele não achar, ele cria um novo registro. Já conhecemos os três primeiros registros, então vamos tentar achar o primeiro:  

```php
<?php

public function example2()
{
    // firstOrCreate
    $posts = Post::firstOrCreate([
        'title' => 'Velit velit fuga fugiat repudiandae tempore.',
        'content' => 'Est vel sapiente assumenda consectetur. Iusto corporis laudantium aspernatur hic quo iure corrupti. Eaque alias quos maiores perferendis. Dolor veniam distinctio mollitia exercitationem.',
    ]);

    return $posts;
}

?>
```  

E isso é retornado:  

```json
{
id: 1,
title: "Velit velit fuga fugiat repudiandae tempore.",
content: "Est vel sapiente assumenda consectetur. Iusto corporis laudantium aspernatur hic quo iure corrupti. Eaque alias quos maiores perferendis. Dolor veniam distinctio mollitia exercitationem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:42:52"
}
```  

O primeiro registro é retornado porque o Eloquent conseguiu achar um registro que corresponde aos atributos que passamos. No entanto, se tentássemos o seguinte código:  

```php 

<?php 

public function example2()
{
    // firstOrCreate
    $posts = Post::firstOrCreate([
        'title' => 'Velit velit fuga fugiat repudiandae tempore.',
        'content' => 'Whatever',
    ]);

    return $posts;
}

?>

```   

Isso seria retornado:  


```json
{
title: "This one doesnt exist",
content: "Whatever",
created_at: "2016-04-03 02:48:00",
updated_at: "2016-04-03 02:48:00",
id: 101
}
```  

Como você pode ver pelo ID, um registro foi criado. Isso aconteceu porque não foi possível achar um registro que correspondesse aos atributos que passamos, então um novo registro foi criado.  

## each  

O método each é bem simples e executa um callback sobre cada item de uma coleção — é, basicamente, um `foreach`. Então, se quiséssemos mudar o título de todos os registros de 1 a 3, poderíamos fazer da seguinte maneira:  

```php
<?php

public function example3()
{
    $posts = Post::find(['1', '2', '3'])->each(function ($item, $key) {
        $item->update(['title' => 'Whatever']);
    });

    return $posts;
}

?>  
```    

E nos retornaria isso:  

```json
[
{
id: 1,
title: "Whatever",
content: "Est vel sapiente assumenda consectetur. Iusto corporis laudantium aspernatur hic quo iure corrupti. Eaque alias quos maiores perferendis. Dolor veniam distinctio mollitia exercitationem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:59:10"
},
{
id: 2,
title: "Whatever",
content: "Voluptatem recusandae molestiae sint. Ut at ut earum omnis sit totam. Sint hic voluptate autem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:59:10"
},
{
id: 3,
title: "Whatever",
content: "Esse earum velit sed sapiente. Necessitatibus id esse alias nemo est repellendus sapiente. Pariatur sunt distinctio totam culpa similique. Rem sed quo doloremque debitis voluptatibus neque.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:59:10"
}
]
```  

Como você pode ver, os títulos foram alterados. :)  

Por enquanto é isso. No futuro posto sobre outros métodos! 