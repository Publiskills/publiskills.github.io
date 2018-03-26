---
layout: post
title:  "Akka.Net – les fondamentaux"
date:   2018-03-12 09:54:12 +0200
date-modified: 2018-03-12 09:54:12 +0200
ref: akka-net-init
summary: "Nous avons vu dans l’article précédent (Les systèmes réactifs et le pattern actor model) une présentation du pattern actor model et un exemple de système d’acteurs l’utilisant.<br /><br />Nous allons maintenant découvrir une des implémentations de ce pattern : <b>Akka.Net</b>"
thumbnail: "akka-net-init/akka-intro-thumb.jpg"
big-thumb: "akka-net-init/akka-intro-big.jpg"
tags: actor-model akka-net
seo_tags: ["akka", "akka.net", ".net", "net", "reactive", "actor model", "actor", "model"]
---

# Akka.Net

Nous avons vu dans l'article précédent ([Les systèmes réactifs et le pattern actor model](/posts/2017/10/06/l-actor-model/){:target="_blank"}) une présentation du pattern actor model et un exemple de système d'acteurs l'utilisant.

Nous allons maintenant découvrir une des implémentations de ce pattern : [Akka.Net](https://getakka.net/){:target="_blank"}. Il s'agit du portage .Net du framework [Akka](https://akka.io/){:target="_blank"} initialement créé en Scala/Java en 2009.

[Akka.Net](https://getakka.net/){:target="_blank"} a été développé par [Petabridge](https://petabridge.com/){:target="_blank"} et permet de créer rapidement des systèmes implémentant le pattern actor model en balayant toute la complexité technique en se concentrant directement sur l'implémentation des comportements de chaque acteur.

Ce framework permet de créer des systèmes orientés message, scalables, résilients et intrinsèquement distribués.

[Akka.Net](https://getakka.net/){:target="_blank"} (et toutes ses librairies associées) est disponible via [un package nuget](https://www.nuget.org/packages/Akka){:target="_blank"}, et supporte .Net standard 1.6.1.

# Tout acteur vit dans un ActorSystem

Comme l'a dit [Carl Hewitt](https://en.wikipedia.org/wiki/Carl_Hewitt){:target="_blank"} (concepteur du pattern actor model): ***"One actor is no actor, they come in systems"***. En [Akka.Net](https://getakka.net/){:target="_blank"}, ce système est appelé **ActorSystem**. C'est un univers dans lequel les acteurs s'exécutent et communiquent via des messages.

Un **ActorSystem** peut tourner sur une seule machine ou peut être distribué sur plusieurs instances.

Au sein d'un actorSystem, les acteurs sont répartis dans une hiérarchie. Chaque acteur est rattaché à un parent (y compris le **root guardian** qui est un cas particulier) dont il dépend et auquel il délègue certaines responsabilités (notamment la gestion des erreurs).

Pour instancier un actorySystem en C#, il doit être déclaré en lui associant un identifiant:

<div class="highlight">
<pre>
<span class="nf">ActorSystem</span> actorSystem = <span class="nf">ActorSystem</span>.<span class="nf">Create</span>("MyActorSystem");
</pre>
</div>

![ActorSystem](/images/posts/akka-net-init/actor-root.png){: .inline-right-image}

Lors de l'instanciation d'un actorSystem, plusieurs acteurs sont automatiquement créés (appelés *guardians*), ils sont chargés de gérer et maintenir la cohérence de l'ensemble des entités présentes dans l'actorSystem.

- L'acteur **root guardian** ( */* ) : c'est l'acteur au sommet de l'arborescence. Il est le premier à démarrer et le dernier à s'arrêter lors du cycle de vie de l'actorSystem.

- L'acteur **system guardian** ( */system* ) : tous les enfants de cet acteur sont des acteurs utiles au bon fonctionnement de l'actorSystem et gérés directement par le framework.

- L'acteur **user guardian** ( */user* ) : il s'agit du parent de tout acteur instancié par le code utilisant le framework. C'est réellement sous cet acteur que vivra l'ensemble des acteurs que vous allez déclarer.

Les guardians sont des acteurs avec lesquels vous n'aurez quasiment jamais à interagir directement. Tout acteur que vous instancierez possèdera donc un chemin (ou *path*) qui commencera par le préfixe "*/user/*".

# Conception d'un acteur

Pour concevoir un acteur, il est nécessaire de définir une classe héritant du type abstrait **UntypedActor**. La seule chose à définir est la méthode **OnReceive** :

{% highlight csharp %}
public class SimpleUntypedActor : UntypedActor
{
    protected override void OnReceive(object message)
    {
        // Traitement pour tout type de message
    }
}
{% endhighlight %}

À chaque fois qu'une instance de cet acteur recevra un message, la méthode **OnReceive** sera invoquée en recevant en argument le *message* de type *object*. Nous voyons bien que le framework nous permet de nous concentrer sur l'essentiel du comportement d'un acteur : **le traitement des messages qu'il reçoit**.

Le fait de recevoir des messages de type *object* n'est pas très pratique et nous amène très souvent à tester le type réel des messages reçus en utilisant du pattern matching (depuis C#7). Cela génère des déclarations d'acteur ressemblant à :


<div class="highlight">
<pre>
<span class="k">public class</span> SimpleReceiveActor : UntypedActor
{
        <span class="k">protected override void</span> <span class="nf">OnReceive</span>(<span class="kt">object</span> message)
        {
                <span class="k">switch</span>(message)
                {
                        <span class="k">case</span> <span class="kt">Type1</span> messageType1:
                                <span class="c1">// Traitement pour un message de type Type1</span>
                                <span class="k">break</span>;
                        <span class="k">case</span> <span class="kt">Type2</span> messageType2:
                                <span class="c1">// Traitement pour un message de type Type2</span>
                                <span class="k">break</span>;
                        <span class="k">default</span>:
                                <span class="c1">// Traitement pour tout autre type de message</span>
                                <span class="k">break</span>;
                }
        }
}
</pre>
</div>

Pour simplifier la gestion des messages type par type, la classe **ReceiveActor** (qui hérite elle-même du type **UntypedActor**) permet de déterminer une action à exécuter pour chaque type de message reçu.

<div class="highlight">
<pre>
<span class="k">public class</span> SimpleReceiveActor : ReceiveActor
{
        <span class="k">public</span> <span class="nf">SimpleReceiveActor</span>()
        {
                <span class="nf">Receive</span>&lt;<span class="kt">Type1</span>&gt;(messageType1 =>        <span class="c1">/* Traitement pour un message de type Type1   */</span> );
                <span class="nf">Receive</span>&lt;<span class="kt">Type2</span>&gt;(messageType2 =>      <span class="c1">/* Traitement pour un message de type Type2   */</span> );
                <span class="nf">ReceiveAny</span>(message =>                         <span class="c1">/* Traitement pour tout autre type de message */</span> );
        }
}
</pre>
</div>

L'ordre des appels à la méthode générique **Receive&lt;T&gt;** est important, il détermine dans quel ordre l'acteur va tenter d'identifier quelle action exécuter pour le message en cours de traitement.

La méthode **ReceiveAny** permet de définir un comportement pour tout type de message. Lorsqu'elle est utilisée, cette méthode doit bien évidemment être placée à la suite des appels à la méthode **Receive&lt;T&gt;** car elle intercepte tous les types de messages non déclarés.

En plus de la méthode **Receive&lt;T&gt;(T message)**, il existe une méthode **Receive&lt;T&gt;(T message, Predicate&lt;T&gt; predicat)** permettant de filtrer l'action à exécuter, non seulement par un type donné, mais également par un prédicat spécifique.

Par exemple :
<div class="highlight">
<pre>
<span class="k">public class</span> SimpleIntReceiveActor : ReceiveActor
{
        <span class="k">public</span> <span class="nf">SimpleIntReceiveActor</span>()
        {
                <span class="nf">Receive</span>&lt;<span class="kt">int</span>&gt;(intVal => Console.<span class="nf">WriteLine</span>($"{intVal} est pair"),
                                         intVal => (intVal % 2) == 0);
                <span class="nf">Receive</span>&lt;<span class="kt">int</span>&gt;(intVal => Console.<span class="nf">WriteLine</span>($"{intVal} est impair"));
        }
}
</pre>
</div>

Il existe également des méthodes **ReceiveAsync** et **ReceiveAnyAsync** permettant des traitements asynchrones. Tant que le traitement asynchrone n'est pas terminé, l'acteur reste bloqué et commencera à traiter le prochain message à la fin de la tâche asyncrhone.

>Mais que se passe-t-il lorsqu'un message est envoyé à un acteur qui ne prend pas en charge ce type de message ? Est-il perdu ? Par exemple si l'on envoie un message de type string à une instance d'un *SimpleIntReceiveActor*.
><br/><br/>
>Pas vraiment, il est intercepté par un acteur particulier du framework (*DeadLetters*) qui est à l'écoute de ces messages non gérés. Il est possible de s'abonner à cet acteur afin de lui demander de nous transmettre ces messages "perdus". Nous verrons cela dans un autre article concernant les *EventStream*.


# Instanciation d'un acteur

Un acteur n'est jamais directement instancié. Il faut demander au framework de l'instancier pour nous. Deux cas sont possibles :

<ol><li>
Il s'agit d'un acteur principal, situé juste en-dessous de l'acteur <b>user guardian</b> ( <i>/user</i> ):
<br/>Dans ce cas, pour instancier un acteur, il faut appeler la méthode d'extension générique <b>ActorOf&lt;T&gt;</b> sur l'ActorSystem.
<div class="highlight"><pre>
<span class="kt">var</span> actorRef = actorSystem.<span class="nf">ActorOf</span>&lt;<span class="kt">SimpleReceiveActor</span>&gt;("actorName");
</pre></div>
</li><li>
Il s'agit d'un acteur enfant d'un autre <b>acteur</b>
<br/>Pour instancier un enfant d'acteur, il faut appeler la méthode d'extension générique <b>ActorOf&lt;T&gt;</b> sur la propriété <b>Context</b> de l'acteur parent. Cette propriété est implémentée dans la classe <b>UntypedActor</b>.
<div class="highlight"><pre>
<span class="kt">var</span> actorRef = Context.<span class="nf">ActorOf</span>&lt;<span class="kt">SimpleReceiveActor</span>&gt;("actorName");
</pre></div>
</li></ol>

> La classe **ActorSystem** implémente en réalité l'interface **IActorRefFactory**, tout comme la propriété **Context** d'un acteur (*IUntypedActorContext*). **ActorOf&lt;T&gt;** est une méthode d'extension de l'interface *IActorRefFactory*. Les deux cas décrits ci-dessus déclenchent donc finalement l'appel à la même méthode.

Le résultat retourné par l'appel à la méthode **ActorOf&lt;SimpleReceiveActor&gt;** est de type **IActorRef** et non **SimpleReceiveActor**.  Comme nous l'avons vu dans l'<a style="text-decoration:underline;" href="/2018/01/les-systemes-reactifs-et-le-pattern-actor-model/" target="_blank">article précédent</a>, dans le pattern *Actor Model*, les interactions entre acteurs s'effectuent via des références d'acteurs et non via des appels directs aux acteurs. On envoie donc un message à une référence, et pas directement à un acteur.

> Un IActorRef est une référence vers un acteur (ou ensemble d'acteurs) instancié(s) par le framework et doit être utilisé pour toute interaction avec un acteur.

# Les *Props*

Mais comment déclarer un acteur possédant un constructeur recevant des paramètres (pour lui injecter des services par exemple) ? C'est là qu'interviennent les **Props**.

Il existe, en effet, une autre méthode **ActorOf** non générique qui reçoit un objet de type **Props**. Un **Props** est un objet permettant de définir la façon dont un acteur doit être instancié par le framework. Il est, en quelques sortes, le mode d'emploi pour la création d'un acteur et permet donc de pouvoir spécifier des paramètres pour l'instanciation de ce dernier.

{% highlight csharp %}
var actorProps = Props.Create(() => new SimpleReceiveActor(param1, param2));
actorSystem.ActorOf(actorProps, "actorName");
{% endhighlight %}

# Communication entre acteurs

Maintenant que nous savons créer des acteurs, voyons comment les faire communiquer entre eux. Plus exactement, voyons comment envoyer des messages à des **IActorRef**

Il existe trois types d'envoi de message : **Tell**, **Forward** et **Ask**.

<div>
<div class="table-cell-with-code">
<ol><li>
La méthode <strong>Tell</strong> permet d'envoyer simplement un message à un <em>IActorRef</em>.
<div class="code-block highlight">
<pre>
<span class="c1 intro">// Contexte d'exécution : Acteur "a1"</span><br />
a2.<span class="nf">Tell</span>(message);
</pre>
</div>
</li><li>
La méthode <strong>Forward</strong> permet de transférer un message reçu à un autre <em>IActorRef</em> en gardant l'expéditeur d'origine en tant qu'émetteur.
<div class="code-block highlight">
<pre>
<span class="c1 intro">// Contexte d'exécution : Acteur "a2"</span><br />
a3.<span class="nf">Forward</span>(messageReceived); <span class="c1"> // On transfert le message reçu (initialement envoyé par "a1") à l'acteur "a3". "a3" le verra comme ayant été envoyé par "a1".</span>
</pre>
</div>
</li><li>
La méthode <strong>Ask&lt;T&gt;</strong> est un appel qui permet d'envoyer un message et de rester bloqué en attendant une réponse. Cette méthode est à utiliser avec parcimonie car elle ralentit considérablement la consommation des messages.
<div class="code-block highlight">
<pre>
actorRef.<span class="nf">Ask</span>&lt;<span class="kt">TypeDeRetour</span>&gt;(message); <span class="c1"> // A utiliser avec modération car il s'agit d'appels bloquants !</span>
</pre>
</div>
</li></ol>
</div>
<div class="table-cell-when-not-mobile">
<img src="/images/posts/akka-net-init/actor-forward.png" style="max-width:none;" alt="Froward" class="inline-right-image"/>
</div>
</div>


<h3 style="clear:both;"><em>Sender</em> & <em>Self</em></h3>

Il existe deux propriétés particulières attachées à un acteur et plus particulièrement à son contexte lors du traitement d'un message. Il s'agit des propriétés **Sender** et **Self**, elles sont toutes les deux de type **IActorRef**.

+ **Sender** est un pointeur vers l'acteur ayant émis le message en cours de traitement, il permet de pouvoir échanger avec l'acteur à l'origine du traitement en cours.

+ **Self** est un pointeur vers l'acteur lui-même. Il permet de planifier un traitement pour lui-même en se renvoyant un message. Ce message sera alors mis en entrée de sa file de messages à traiter. **Self** permet également à un acteur de transmettre sa référence à d'autres acteurs dans un message.

# Les acteurs en tant que *machine à états finis* (Final Sate Machine - *FSM*)

Comme nous l'avons vu dans <a style="text-decoration:underline;" href="/2018/01/les-systemes-reactifs-et-le-pattern-actor-model" target="_blank">l'article sur le pattern actor model</a>, lors du traitement d'un message, un acteur peut effectuer trois types d'actions :
- Créer un ou plusieurs nouveaux acteurs
- Envoyer un ou plusieurs messages à un nombre fini d’acteurs qu’il connait (y compris lui-même)
- Changer la façon dont il gèrera les messages suivants

Nous avons déjà vu comment créer de nouveaux acteurs et comment envoyer des messages. Nous allons maintenant découvrir comment changer le comportement d'un acteur.

Pour implémenter ces changements d'état, <a href="https://getakka.net/" target="_blank">Akka.Net</a> offre une API qui permet de facilement mettre en place les définitions et les transitions entre ces différents états. Il existe deux types de changements de comportement :
- Le remplacement de comportement
- L'empilement des comportements

## 1. Le remplacement de comportement - *Become*

Pour définir un nouveau comportement, il est possible d'invoquer la méthode **Become** en lui passant en argument une *Action* définissant le comportement à adopter lors du traitement du prochain message.

Ce nouveau comportement sera alors maintenu jusqu'au prochain appel à la méthode **Become** qui le remplacera.

Voyons un exemple simple d'acteur qui utilise la méthode **Become** :

{% highlight csharp linenos %}
public class BiStateActor : ReceiveActor
{
    public BiStateActor()
    {
        // L'acteur traitera le prochain message avec le comportement "HappyActor"
        Become(HappyActor);
    }

    private void HappyActor()
    {
        ReceiveAny(m => {
            Sender.Tell("I'm happy :)");

            // L'acteur traitera le prochain message avec le comportement "SadActor"
            Become(SadActor);
        });
    }

    private void SadActor()
    {
        ReceiveAny(m => {
            Sender.Tell("I'm sad :(");

            // L'acteur traitera le prochain message avec le comportement "HappyActor"
            Become(HappyActor);
        });
    }
}
{% endhighlight %}

Tout d'abord, cet acteur adopte le comportement *HappyActor* (affecté dans le constructeur - <span style="text-decoration:underline;">ligne 6</span>).

Lors de la réception du premier message, cet acteur retournera donc à son expéditeur le message "I'm happy :)" puis changera de comportement pour le message suivant, où il adoptera le comportement *SadActor* (<span style="text-decoration:underline;">ligne 15</span>).

Lors de la réception du message suivant, il retournera donc à son expéditeur le message "I'm sad :(" puis changera de comportement pour le message suivant en adoptant le comportement *HappyActor* (<span style="text-decoration:underline;">ligne 25</span>).

La boucle est bouclée, nous avons un acteur qui change de comportement à chaque message reçu.

## 2. L'empilement des comportements - *BecomeStacked* et *UnBecomeStacked*

Le fonctionnement des méthodes *BecomeStacked* et *UnBecomeStacked* est similaire au fonctionnement de *Become*, à la différence que le nouveau comportement est empilé au-dessus du comportement en cours (*BecomeStacked*). Le nouveau comportement est donc adopté, mais il est possible de revenir au comportement précédent en demandant à l'acteur de dépiler son comportement courant (*BecomeStacked*).

Analysons l'acteur **StackedBiStateActor** suivant :

{% highlight csharp linenos %}
public class StackedBiStateActor : ReceiveActor
{
    public StackedBiStateActor()
    {
        // L'acteur démarre avec le comportement "HappyActor"
        BecomeStacked(HappyActor);
    }

    private void HappyActor()
    {
        ReceiveAny(m => {
            Sender.Tell("I'm happy :)");

            // On empile le comportement "SadActor". L'acteur aura désormais le comportement "SadActor"
            BecomeStacked(SadActor);
        });
    }

    private void SadActor()
    {
        ReceiveAny(m => {
            Sender.Tell("I'm sad :(");

            // On dépile le comportement en cours ("SadActor").
            // L'acteur aura donc désormais le comportement précédent ("HappyActor")
            UnbecomeStacked();
        });
    }
}
{% endhighlight %}

Son comportement est exactement le même que l'acteur **BiStateActor** vu juste avant, il utilise cependant les méthodes *BecomeStacked* et *UnBecomeStacked*.

L'acteur démarre en empilant le comportement *HappyActor* (Étape 1) (<span style="text-decoration:underline;">ligne 6</span>), sa pile de comportements contient donc uniquement le comportement *HappyActor* et il retournera “I’m happy :)” lors du traitement de son prochain message (Étape 2).

Il empilera ensuite le comportement *SadActor*  (Étape 3) (<span style="text-decoration:underline;">ligne 15</span>) au-dessus du comportement *HappyActor* et retournera “I’m sad :(” à la réception du message suivant (Étape 4).

Il dépilera ensuite le comportement courant, à savoir *SadActor* (Étape 5) (<span style="text-decoration:underline;">ligne 26</span>), et se retrouvera donc avec uniquement le comportement *HappyActor* dans sa pile (Étape 6).

Nous sommes revenus au comportement initial.

Pour mieux comprendre, voici les étapes :
<div style="text-align:center;">
<img src="/images/posts/akka-net-init/behaviour-stacks-1.png" alt="stacked behaviour 1" class="inline-image" style="margin:0;" /><img src="/images/posts/akka-net-init/behaviour-stacks-2.png" alt="stacked behaviour 2" class="inline-image" style="margin:0;"  /><img src="/images/posts/akka-net-init/behaviour-stacks-3.png" alt="stacked behaviour 3" class="inline-image" style="margin:0;"  />
</div>

## 3. Alors, *Become* ou *BecomeStacked/UnBecomeStacked* ?

Tout dépend de l'acteur que vous implémentez. *Become* n'est qu'une particularité de l'utilisation des méthodes *BecomeStacked* et *UnBecomeStacked*.

> Lors de l'appel à la méthode *Become*, <a href="https://getakka.net/" target="_blank">Akka.Net</a> utilise en interne la fonctionnalité *BecomeStacked*.

Dans la plupart des cas, *Become* suffit, cependant il peut arriver que vous ayez besoin de garder une trace des comportements précédents de l'acteur pour pouvoir, éventuellement, les restaurer par la suite. Dans ce cas, l'utilisation de *BecomeStacked/UnBecomeStacked* est votre solution.

Prenons, par exemple, le cas d'un acteur chargé de gérer le parcours d'un client sur un site d'e-commerce. Le client passe par les comportements *Non connecté*, *Connecté*, *En cours de shopping*, *En cours de saisie d'adresse*, *En cours de paiement* et là, sa session expire. Il se retrouve alors de nouveau avec le comportement *Non connecté*. Lorsque l'utilisateur se reconnecte, ne serait-il pas intéressant de restaurer le comportement *En cours de paiement* plutôt que de lui assigner le comportement *Connecté* ? Si ces comportements avaient été empilés (*BecomeStacked*), il suffirait alors d'invoquer la méthode *UnBecomeStacked* pour qu'il retrouve le comportement qu'il avait avant sa déconnexion.

# Mise en pratique

Le code source d'un projet illustrant tous ces principes est disponible à l'adresse suivante : <a href="https://github.com/Publiskills/AkkaPlayground" style="text-decoration:underline;" target="_blank">Repository Github AkkaPlayground</a>

# On the next episode(s)...

Nous venons de voir les bases de l'utilisation du framework <a href="https://getakka.net/" target="_blank">Akka.Net</a>. Celui-ci permet d'implémenter facilement une solution basée sur [le pattern actor model](/posts/2017/10/06/l-actor-model/){:target="_blank"} en se concentrant directement sur les comportements des acteurs et leur communication.

Le framework permet de définir les trois types d'actions que peut faire un acteur :
– Créer de nouveaux acteurs via la méthode **ActorOf** et les **Props**
– Envoyer des messages via les méthodes **Tell**, **Forward** et **Ask**
– Changer la façon dont il gèrera les messages suivants via les méthodes **Become**, **BecomeStacked** et **UnbecomeStacked**

Pour continuer notre voyage dans le monde de l'actor model et le framework <a href="https://getakka.net/" target="_blank">Akka.Net</a>, nous étudierons dans un prochain article, les groupes et les pools d'acteurs.

<style type="text/css">
.table-cell-with-code {
    display:table-cell;
}
.table-cell-when-not-mobile {
    text-align: center;
}
.code-block {
    border-radius: 0.3rem;
    -webkit-border-radius: 0.3rem;
    -moz-border-radius: 0.3rem;
    background: #343642;
    color: #C1C2C3;
    margin: 1em 0;
    padding: 0 1.5rem;
}
.highlight pre {
    font-family: Montserrat;
}
.code-block pre {
    white-space: normal !important;
}
.code-block pre .intro {
    display: inline-block;
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
}
@media (min-width: 600px) {
    .table-cell-when-not-mobile {
        display:table-cell;
        vertical-align: middle;
    }
}
</style>
