---
layout: post
title: "Matando switches com arrays"
date: 2017-05-18 17:20:00
image: '/assets/img/posts/cleaning-up-switch-statements.png'
description: "Cleaning up switch statements with lookup tables"
tags:
- php
- laravel
- clean
categories:
- php
- laravel
twitter_text:
---

Eu lembro que tive que trabalhar num código com um switch e era mais ou menos assim   

```php   
<?php
function get_state($state)
{
    switch ($state) {
        case 'CA':
            $state = 'California';
        case 'CO':
            $state = 'Colorado';
        case 'TX':
            $state = 'Texas';
        default:
            $state = 'Texas';
    }

    return $state;
}
```   

Bem simples — pega as iniciais de um estado e retorna o nome completo. No entanto, há duas linhas de código para cada estado e é bem verboso. Para 48 estados seriam **no mínimo** 96 linhas. Podemos limpar isso bem rápido usando lookup tables. Ao invés de escrever dezenas de casos para o switch, podemos definir um array contendo as iniciais de cada estado e o nome completo como `key => value`.  


```php  
<?php
function get_state($state)
{
	$states = [
		'CA' => 'California',
		'CO' => 'Colorado',
		'TX' => 'Texas'
	];

	return $states[$state] ?? $states['TX'];
}
```

É bem simples mas ajuda bastante. Ao invés de escrever switches gigantescos, escreva um array e busque o que quer pelo índice. Se não for achado, apenas retorne algum valor padrão (ou uma exception, ou false, ou o que você quiser) usando o [null coalescing operator](http://php.net/manual/en/migration70.new-features.php#migration70.new-features.null-coalesce-op).

Espero ter ajudado :-)
