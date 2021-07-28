# k6 & Prometheus & Keda & Kubernetes: Configurando, monitorando e testando um HPA no Kubernetes

Este é um projeto de exemplo que demonstra como testar o auto-scaling do Keda no Kubernetes.
Este projeto é um fork [deste artigo do k6](https://dev.to/k6/how-to-autoscale-kubernetes-pods-with-keda-testing-with-k6-4nl9), com as adições dos seguintes itens:

- Adicionando detalhes para configurar o auto-scaling de forma didática
- Atualizando o yaml do Keda para ser compatível com a versão 2.0
- Utilizando inFlux DB 2.0 e adicionando as configurações necessárias
- Adicionadas as configurações para configurar o Prometheus corretamente
- Utilizando um server com dados de todas as edições do MeetUp DevTest BR


## Pré-requisitos

Você precisará instalar os seguintes itens:

- [k6](https://k6.io/docs/getting-started/installation)
- Node.js
- Docker
- GNU Make ou XCode (Mac)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)

Se precisar, [existe este tutorial para instalar o minikube para usuários do Ubuntu 18:04](https://computingforgeeks.com/how-to-install-minikube-on-ubuntu-18-04/).

Vale ressaltar que o Minikube não é mandatório, e sim qualquer gerenciador ou cliente Kubernetes. Vale também para K3s ou MicroK8.


## Configurando o Ambiente

### 0. Clone este repositório
Clonar o repositório do exemplo.​
​

``` bash
$ git clone​
https://github.com/KelvinKSPS/example-kubernetes-autoscaling-nodejs-api
```
​

Acompanhar post que motivou este exemplo da apresentação:​
​
``` bash
$ open shorturl.at/psLOT​
```

### 1. Server
Vamos usar um servidor em NodeJS que gerencia os dados de todos os eventos do DevTestBR. Vamos adicionar as métricas preparadas para o Prometheus - uma plataforma open source de monitoramento.​

> NodeJS: Plataforma assíncrona orientada à eventos criada para desenvolver sistemas escaláveis em Javascript
​



### 2. Minikube

O Minikube é uma implementação leve do Kubernetes que cria uma VM em sua máquina local e implanta um cluster simples contendo apenas um nó. O Minikube está disponível para sistemas Linux, macOS e Windows.

> Kubernetes, basicamente, é uma plataforma de código aberto que automatiza a implantação, dimensiona e gerencia aplicativos em contêineres. ​

Uma vez instalado o minikube (consulte seu OS), iremos usar o kubectl.

> Kubectl é um utilitário de linha de comando que se conecta ao servidor API, usado pelos administradores para criar pods, deployments, serviços, etc. Vamos usa-lo bastante para gerenciar nosso cluster.​

```bash


# habilitando o dashboard do kubernetes​
$ minikube addons enable dashboard​
​
# habilitando o ingress, uma interface via API para definir regras e permitir acesso externo para os serviços dentro do cluster:​
$ minikube addons enable ingress ​
$ minikube addons enable ingress-dns ​
​
# habilitando o tunnel para acessar as portas do cluster através da web:​
$ minikube tunnel​
​
# acessando o dashboard do kubernetes​
$ minikube dashboard


```

### 4. Deploy do Kube State Metrics Server

> kube State Metrics coleta várias métrricas sobre os serviços que estão rodando no Kubernetes, através das APIs.​

```bash

# Clona o repositório do kube State Metrics​
$ git clone https://github.com/devopscube/kube-state-metrics-configs.git​
​
# Cria os objetos do repositório recém criado:​
$ kubectl apply -f kube-state-metrics-configs/​
​

# Verifica se o deploy foi realizado corretamente.​

$ kubectl get deployments kube-state-metrics -n kube-system


```


### 5. Deploy do Prometheus​

> Prometheus é uma ferramenta open source para monitoramento de dados. Na pasta raíz do projeto:​

```bash
# Criar um namespace no kubernetes​
$ kubectl create namespace monitoring​
​
# Criar um clusterRole​
$ kubeclt create –f prometheus/clusterRole.yaml​
​
# Criar um Config Map para não precisar buildar o Prometheus toda hora que for # adicionar ou remover configurações​
$ kubectl create –f prometheus/config-map.yaml​
​
# Enfim, deploy do prometheus​
$ kubectl create  -f prometheus/prometheus-deployment.yaml ​

```

### 6. Externalizar Prometheus

Externalizando o Prometheus, podemos acessar o mesmo do lado de fora do k8s.​

``` bash

# Copiar o nome da pod do Prometheus​
$ kubectl get pods --namespace=monitoring​
​
# Criar o encaminhamento de porta pelo kubectl​
$ kubectl port-forward prometheus-monitoring-<id-da-pod> 8080:9090 -n monitoring​

```


### 7. Instalar influxDB (V1) e Grafana (localmente ou no kubernetes)

> InfluxDB => É um banco de dados de código aberto designado para lidar com um alto volume de consultas e escritas por segundo sem causar muito impacto no sistema operaciona​
​


> Grafana => O Grafana é uma plataforma para visualizar e analisar métricas por meio de gráficos. Ele tem suporte para diversos tipos de bancos de dados — tanto gratuitos quanto pagos —, e pode ser instalado em qualquer sistema operacional.​


Usaremos o Grafana para visualizar os dados, enquando usaremos o influxDB para armazenar os dados do teste.

### 8. Adicionar dados do Grafana
Iremos indicar ao Grafana as fontes de dados que devem ser monitoradas.​
No Grafana, vá em Configuration > Data Sources. Adicione os seguintes sources:​

 ```​
influxDB:​
​
Name: InfluxDB-K6​

URL: http://localhost:8086​

Access: Server​

Database: k6​

HTTP Method: GET​

Min time interval: 5s
```

```
​
Prometheus:​
​
*Name: InfluxDB-K6​

URL: http://<prometheus ip address>:8080/​

Access: Server​

Scrape interval: 5s​

Query timeout: 30s​

HTTP Method: GET​

​
```

### 9. Configurando o KEDA

KEDA significa Kubernetes Event Driven Autoscaler. ​
​
Com o KEDA, podemos configurar nossas pods ou ​
nossos deployments para escalar ​
conforme regras que estabelecemos.​​

```
# Deploy KEDA to Kubernetes​
$ kubectl apply -f https://github.com/kedacore/keda/releases/download/v2.2.0/keda-2.2.0.yaml​
```
​
### 10. Dashboard

No Grafana, selecione para importar um Dashboard e selecione o arquivo grafana/devtestbr-metrics-dashboard.json​

### 11. Enfim, vamos testar!!

```# Pegar o IP do serviço​
$ kubectl get services​

​

ENDPOINT=http://{ip serviço}:4000/devtestbr k6 run -o influxdb=http://localhost:8086/k6 performance-test.js​
​
ou​
​
ENDPOINT=http://{ip serviço}:4000/devtestbr k6 run performance-test.js​
```


Iremos verificar o auto-scalling acontecendo conforme as configurações que você preferir, no KEDA.

Abra o Grafana e veja a mágica!