---
layout: post
title: "Busca binária desmistificada"
date: 2016-03-10 01:57:52
image: '/assets/img/posts/binary-search-demystified.png'
description: 'Explicação simples de como funciona a busca binária'
tags:
- programação
- algoritmos
- busca binária
categories:
- algoritmos
twitter_text:
---

Nesse post eu vou tentar explicar rapidamente o que é a busca binária.  

Uma busca binária é apenas um algoritmo que acha um valor dentro de um array **ordenado**. Se o array **não estiver ordenado**, talvez seja melhor usar busca linear ao invés de ordená-lo e depois usar a busca binária. Ela executa em tempo **O(log n)**. Se você não é familiarizado com essa notação, talvez seja interessante dar uma lida em [notação Big-O](https://pt.wikipedia.org/wiki/Nota%C3%A7%C3%A3o_Big-O) e [complexidade temporal](https://en.wikipedia.org/wiki/Time_complexity).   

Imagina que você tem o seguinte array: `[1, 3, 9, 14, 15, 19, 44, 54]`. Você quer achar o índice do número `15` e instantaneamente pensa em uma solução! é só iterar o array e checar se o valor do índice atual é igual ao que você quer. Então é só escrever algo assim em Javascript:  

```javascript
function linearSearch(array, number) {
	
	for(var i = 0; i < array.length; i++) {
		if(array[i] === number) {
			return i;
		}
	}

	return -1;
}

var array = [1, 3, 9, 14, 15, 19, 44, 51];
console.log(linearSearch(array, 15));
```

É bem simples: primeiro, declaro a função `linearSearch` que aceita dois argumentos: o próprio array e o valor que queremos encontrar.  

Depois, iteramos o array usando um loop `for` e depois checamos se o valor de cada índice em que estamos é igual ao valor que queremos encontrar — se for, retornamos o índice (lembre-se que na maioria das linguagens, o índice inicial de um array é **0** e não 1). Se o loop rodar e nada for encontrado, retorna `-1`.  

Depois, criamos uma variável com o nosso array e chamamos a função. Se você rodar o código acima, receberá `4`, porque o índice do valor `15` é `array[4]`.  

Agora, você provavelmente notou que esse algoritmo não deve ser muito eficiente quando estiver trabalhando com uma quantidade grande de dados, certo? Vai começar iterando do ínicio do array até achar um valor, e talvez tenha que percorrer grande parte/todo o array. É aí que a busca binária se torna uma opção interessante.  

## Busca Binária 


A busca binária funciona de forma diferente da busca linear. Ao invés de iterar sobre todo o array, nós "chutamos" índices e comparamos o valor deles ao que queremos. Então, vamos dizer que temos um array "grande", composto de `20001` números aleatórios. Ao invés de começar a busca no primeiro índice, nós iremos começar na metade do array, no índice `10000`. Depois, checamos se o valor desse índice é igual ao valor que queremos — se for, nós o retornamos. Se não for, checamos se o valor é maior ou menor do que o valor que queremos. Se for menor, isso significa que tudo à "esquerda" de onde estamos (índice `10000`) é inútil. Se o índice `10000` for maior do que o valor que queremos, significa que tudo à direita é inútil.  E assim, vamos partindo o array na metade à cada iteração, até chegarmos a intervalos extremamente pequenos e aí fica muito mais rápido achar o nosso valor.  

Podemos fazer isso mais ou menos assim:  

```javascript
function binarySearch(array, n) {
	var min = 0;
	var max = array.length - 1;
	var avg;

	while(min <= max) {
		avg = parseInt((max + min) / 2);

		if(array[avg] === n) {
			return avg;
		}
		else if(array[avg] < n) {
			min = avg + 1;
		} else {
			max = avg - 1;
		}
	}

	return -1;
}

var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

console.log(binarySearch(primes, 97));
```  

Essa é uma das minhas soluções para um problema de um exercício da Codility.  

Começamos declarando uma função que — assim como na busca linear —, aceita dois argumentos. O primeiro é o próprio array e o segundo é o valor que queremos achar.  

Depois, começamos a declarar nossas váriaveis. `min` sendo o valor mínimo (`0`, para começar, assim como o primeiro índice do array) e `max` sendo o último índice do array. Lembre-se que um array começa no índice `0`, é por isso que subtraímos `1` do tamanho do array.  

Depois declaramos nossa variável `avg` (média) porque vamos usá-la.  

No loop `while` é onde as coisas ficam "complicadas". Primeiro, estabelecemos uma condição de que o loop irá rodar até que `min` seja menor ou igual à `max`. Fazemos isso porque — como disse antes – iremos eliminar metade do array à cada loop. Depois, declaramos nossa variável `avg`, que será a média entre `max` e `min`. Eu usei o `parseInt` para retornar um inteiro (sem decimais), mas se me lembro corretamente, `Math.floor` é mais rápido. Agora que temos nossa média, devemos testar as possibilidades. Primeiro, vemos se o valor do índice em que estamos é o número que queremos. Se for, perfeito! retornamos o índice. Se não for, tem duas possibilidades:  

* O valor do índice em que estamos é menor do que o que queremos. Se isso for verdade, qualquer índice que venha antes do em que estamos pode ser descartado. Por isso, declaramos que `min` é `avg + 1`, removendo metade do array e agora mais perto de concluir a condição do loop. 
* O valor do índice em que estamos é maior do que o que queremos. Se isso for verdade, qualquer índice que venha depois do em que estamos pode ser descartado.  
Por isso, declaramos que `max` é `avg - 1`, também removendo metade dos elementos do array.  

E isso se repetirá até que achemos um número ou até que `max` fique igual a `min`. Se o último acontecer e nenhum valor for encontrado, isso significa que o nosso valor não está no array e retornamos `-1`. Simples, não? :)