---
layout: post
title:  "Les systèmes réactifs et le pattern actor model"
date:   2017-10-06 06:53:12 +0200
ref: actor-model
summary: "Cet article est le premier d'une série traitant du pattern actor model et des différentes solutions actuellement disponibles pour implémenter des systèmes s'appuyant sur ce passionant modèle de conception.<br /><br />Nous y verrons les principes fondamentaux de ce pattern et illustrerons ces concepts en amalysant un exemple de système d'acteurs complet."
thumbnail: "actor-model/mini-thumbnail.jpg"
big-thumb: "actor-model/intro-image.jpg"
tags: actor-model
seo_tags: ["akka", "akka.net", ".net", "net", "reactive", "actor model", "actor", "model"]
---

# Les règles du jeu ont changé

![Evolution](/images/posts/actor-model/evolution.jpg){: .inline-right-image}
Les systèmes informatiques ont énormément évolué au cours de ces dernières décennies. Tant au niveau des capacités disponibles qu’au niveau des performances demandées.

Les choix d’architecture logicielle étaient précédemment effectués dans un contexte où les infrastructures étaient bien moins flexibles et représentaient des coûts plus importants. Mais les règles du jeu ont bien changé depuis.

Cet article est le premier d'une série traitant du pattern actor model et des différentes solutions actuellement disponibles pour implémenter des systèmes s'appuyant sur ce passionnant modèle de conception.

## Les systèmes réactifs

Le besoin de changer de conception est né de la divergence de l’évolution de deux facteurs :

### - Les sollicitations et les exigences des utilisateurs

![Increasing](/images/posts/actor-model/increase.jpg){: .inline-left-image}
- Le nombre d’accès concurrents (utilisateurs) a explosé au cours des dernières années.
- La volumétrie des données gérées et stockées a augmenté.
- Les exigences des utilisateurs en termes de réactivité ne sont plus les mêmes.

### - Les coûts et la compléxité de gestion de l’infrastructure
{: .clear}

![Decreasing](/images/posts/actor-model/decrease.jpg){: .inline-left-image}
- Les coûts de l’infrastructure ont drastiquement diminué (RAM, stockage, puissance de calcul…).
- Les temps de latences des communications réseau se comptent désormais en millisecondes.
- La complexité de scalabilité des plateformes a été réduite au minimum (IAAS, PAAS).

Ces évolutions nous ont amenés à repenser les architectures sur lesquelles sont basés nos solutions informatiques actuelles. L’approche réactive se veut très pragmatique, elle définit un ensemble de quatre critères qui doivent être remplis pour pouvoir qualifier un système comme « réactif ».
{: .clear}

## Le reactive manifesto

Un système dit « réactif » doit donc répondre aux 4 critères suivants :

### 1. Disponible (Responsive) &#8680; *assure la réactivité à la sollicitation sous toute condition*

![Responsive](/images/posts/actor-model/responsive.jpg){: .inline-left-image}
Le système répond rapidement et de façon constante, dans la mesure du possible, en toutes circonstances. La rapidité et la constance du service fournit par le système est ce qui en assure sa pérennité. Cette disponibilité est assurée par les trois autres caractéristiques d’un système réactif.

### 2. Résilient (Resilient) &#8680; *assure la réactivité face aux erreurs*

![Resilient](/images/posts/actor-model/resilient.jpg){: .inline-left-image}
La disponibilité du système reste assurée en cas d’erreur au sein d’un de ses composants. L’isolation des composants permet d’éviter la propagation des erreurs. Elles sont gérées localement ou par un composant de supervision.

### 3. Souple (Elastic) &#8680; *assure la réactivité face à la charge*

![Elastic](/images/posts/actor-model/elastic.jpg){: .inline-left-image}
Le système répond rapidement quelle que soit la charge de travail. Il doit être évolutif (scalable) et pouvoir s’adapter aux contextes changeants. Cette « élasticité » est rendue possible par la nature « orientée message » du système qui permet facilement une redistribution des messages.

### 4. Orienté message (Message driven) &#8680; *assure la réactivité face aux évènements*

![Message driven](/images/posts/actor-model/message-driven.jpg){: .inline-left-image}
Les échanges entre les composants se font par l’échange de messages asynchrones afin de garantir leur faible couplage, leur transparence de localisation et leur isolation.

![Le reactive manifesto](/images/posts/actor-model/reactive-manifesto.jpg)
{: .centered-image}

N’hésitez pas à aller consulter (et signer !) [le reactive manifesto](http://www.reactivemanifesto.org){:target="_blank"} pour de plus amples informations.

# L'actor model (modèle d’acteur)

## Un  peu d'histoire

La première approche du pattern actor model a été proposée en 1973 dans la publication "A Universal Modular Actor Formalism for Artificial Intelligence".
[Carl Hewitt](https://en.wikipedia.org/wiki/Carl_Hewitt){:target="_blank"}, Peter Bishop et Richard Steiger décrivent alors un modèle permettant de simplifier la gestion des traitements parallèles.
Cette conceptualisation présupposait que le modèle s'exécute dans un réseau de communication dont les latences sont quasiment négligeables.

De telles performances n'étaient pas disponibles alors, mais les choses ont bien changé depuis.

## Les concepts de l'actor model

*"En informatique, le modèle d'acteur est un modèle mathématique qui considère des acteurs comme les seules fonctions primitives nécessaires pour la programmation concurrente. Les acteurs communiquent par échange de messages."* ([Wikipedia](https://fr.wikipedia.org/wiki/Mod%C3%A8le_d%27acteur){:target="_blank"})

Un acteur interagit indirectement avec d’autres acteurs en envoyant des messages à leurs adresses, dont il a sauvegardé les références, sans se soucier de leurs états ou de leurs localisations (processus, machine, …).

Plusieurs adresses peuvent pointer sur un même acteur alors qu'une adresse peut représenter plusieurs acteurs.

Un acteur dispose d’une file d’attente (mailbox) pour les messages qu’il reçoit. Il traite ces derniers **un par un** et ne fait donc qu’**un seul traitement à la fois**.

Il n'y a **aucune mémoire partagée** entre différents acteurs. Les acteurs ne communiquent pas en partageant de la mémoire, mais **ils partagent de la mémoire en communiquant**.

>![Actions possibles](/images/posts/actor-model/actor-actions.gif){: .inline-right-image .bordered-image}
>Lors du traitement d’un message, un acteur peut seulement exécuter une ou plusieurs des actions suivantes :
>- Créer un ou plusieurs nouveaux acteurs
>- Envoyer un ou plusieurs messages à un nombre fini d’acteurs qu’il connait (y compris lui-même)
>- Changer la façon dont il gèrera les messages suivants

Un acteur dispose donc d'un nombre limité d'actions possibles lors du traitement d'un message. Il se contente de réaliser la fonction primitive à laquelle il est dédié et de communiquer ses résultats.

>Pour résumer, un acteur encapsule :
>![Composition d'un acteur](/images/posts/actor-model/actor-composition.jpg){: .inline-right-image .bordered-image}
>- Un état interne isolé des autres acteurs
>- Un comportement (logique primitive de traitement) qui est sa raison d'être
>- Une file d’attente de messages qu'il traite un par un
>- Un protocole de communication avec d’autres acteurs

### Analogies entre actor model et programmation orientée objet (POO)

Ce modèle considère que « tout est acteur ». Cette approche est similaire à l’approche du « tout est objet » de la POO, mais à des niveaux d’abstraction et d’isolation supérieurs.

Nous pouvons également remarquer les analogies suivantes entre Actor model et POO:

|                               | Actor model                       | POO                               |
| ----------------------------- | --------------------------------- | --------------------------------- |
| *Philosophie*                 | Tout est acteur	                | Tout est objet                    |
| *Accès à une entité*	        | Adresse(s) de l'acteur	        | Référence(s) de l’objet           |
| *Interactions entre entités*	| Envoi de message (non bloquant)	| Invocation de méthode (bloquant)  |
| *Gestion des interactions*	| File d’attente de messages	    | Pile d’appel                      |
| *Gestion de la concurrence*	| Intrinsèque	                    | Possible mais très vite complexe  |
{: .centered-table}

>L'actor model permet de créer facilement des architectures réactives. De par sa nature intrinsèquement découplée et nativement orientée message, il permet de concevoir des systèmes résilients et aisément scalables.

## Présentation d'un système d'acteurs complet

La théorie est intéressante, mais passons à un exemple concret afin de bien comprendre les possibilités de ce pattern.

Nous allons ici étudier un système de gestion d'upload d'image sur un site de réseau social.

Voici la représentation du système d'acteurs mis en place :

![Exemple d'un système d'acteurs](/images/posts/actor-model/actor-system.jpg)
{: .centered-image .bordered-image}

Trois grandes actions sont réalisées par ce système :

- Validation du contenu (détection des images au contenu inapproprié)
- Génération des miniatures
- Agrégation d'informations liées à l'image

Les messages d'upload d'image "ImageUploaded" sont réceptionnés par l'acteur *ImageReceiver* qui se charge de transmettre de nouveaux messages à destination des acteurs suivants (*ExplicitContentDetector*, *ThumbnailGenerator/ImageFileDispatcher* et *ImagePreprocessor*).

Ces trois messages déclenchent donc les trois sous-tâches suivantes en parallèle.

### Validation du contenu (détection des images au contenu explicite)

L'acteur *ExplicitContentDetector* réalise une analyse de l'image et envoie un message à l'acteur *ExplicitContentNotifier* si un contenu inapproprié est détecté.
Si l'image est conforme, il le notifie à l'acteur l'ayant sollicité (*ImageReceiver*).

L'acteur *ExplicitContentNotifier* prend en charge de publier un message d'alerte "ExplicitContentDetected" (mail, avertissement...) lorsqu'il reçoit une demande de notification.

### Génération des miniatures

Si l'image uploadée est trop grande, une demande de redimensionnement est envoyée à l'acteur *ThumbnailGenerator*. Dans le cas contraire, le message est directement passé à l'acteur *ImageFileDispatcher*.

Lorsque l'acteur *ImageFileDispatcher* reçoit un message (peu importe la provenance), il transmet un message à l'acteur *EnrichedImageFileDispatcher* pour lui signaler la fin de son travail (gestion des miniatures).

### Agrégation d'informations liées à l'image

Cette partie du système, en charge de la recherche d'informations, constituée des acteurs *ImagePreprocessor*, *ImageFilter*, *ContentEnricher*, *FaceDetector*, *UserDataProvider*, *ImageDuplicateFinder* et *DataAggregator*.

En tout premier lieu, un prétraitement de l'image est effectué en amont par les acteurs *ImagePreprocessor* et *ImageFilter* pour faciliter l'analyse de l'image.

![Détection d'utilisateurs](/images/posts/actor-model/face-detection.jpg){: .inline-right-image .bordered-image}

Une partie du système prend en charge la détection d'utilisateurs dans les images (*FaceDetector*) et l'ajout de leurs informations associées (*UserDataProvider*).

Il est intéressant de noter que l'acteur *FaceDetector* est en réalité exécuté sur plusieurs instances. Il est créé à la volée par le *ContentEnricher* afin d'exécuter cette tâche longue et bloquante (une seule action à la fois) sans impacter le reste du système. Il est ensuite détruit une fois son action terminée.

L'autre partie prend en charge la détection des doublons d'image au sein de l'ensemble des images déjà uploadées (*ImageDuplicateFinder*).

### Transmission du résultat de l'analyse

L'ensemble des données récoltées par l'analyse est enfin rattaché à la miniature (*DataAggregator* et *EnrichedImageFileDispatcher*) généré en parallèle par la partie *Géneration des miniatures*.

Un message "EnrichedImageValidated" est alors publié vers l'extérieur du système pour notifier celui-ci de la fin du traitement d'une image uploadée.

## L'actor model démystifié par son concepteur en personne

Je vous laisse regarder cette excellente vidéo dans laquelle son concepteur, [Carl Hewitt](https://en.wikipedia.org/wiki/Carl_Hewitt){:target="_blank"}, nous présente l'actor model. Il y détaille les concepts fondamentaux et la philosophie du modèle (vidéo en anglais) :

<div class="youtube-wrapper"><div class="youtube-video"><iframe src="https://www.youtube.com/embed/7erJ1DV_Tlo" frameborder="0" allowfullscreen></iframe></div></div>

## On the next episode(s)...

Nous venons de voir en détail la théorie du pattern actor model. Dans un prochain article, je vous présenterai une des implémentations disponibles de ce pattern : Akka.Net.

Nous y verrons comment mettre en place un système d'acteurs basique puis nous avancerons plus en détail, dans les articles suivants, pour explorer les possibilités et les différentes briques de ce framework (acteurs, testabilité, cluster, streams...).

Nous verrons également au cours de cette série de posts sur l'actor model d'autres implémentations actuellement disponibles sur le marché (*Orleans*, *Azure Service Fabric - Reliable actors* ...).
