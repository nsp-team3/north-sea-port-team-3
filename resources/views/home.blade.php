<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ONS</title>
    <link rel="stylesheet" href="/css/app.css" />
    <!-- https://favicon.io/favicon-converter/ -->
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="manifest" href="/favicon/site.webmanifest">
    <script src="/js/app.js"></script>
</head>

<body>
    <!-- optionally define the sidebar content via HTML markup -->
    <div id="sidebar" class="leaflet-sidebar collapsed">

        <!-- Navigatie tabblad iconen -->
        <div class="leaflet-sidebar-tabs">
            <!-- vanboven gepinde items -->
            <ul role="tablist">
                <li><a href="#vesselsTab" role="tab"><i class="fa fa-ship active"></i></a></li>
                <li><a href="#portsTab" role="tab"><i class="fa fa-anchor"></i></a></li>
                <li><a href="#berthsTab" role="tab"><i class="fa fa-anchor"></i></a></li>
            </ul>

            <!-- vanonder gepinde items -->
            <ul role="tablist">
                <li><a href="#legendasTab" role="tab"><i class="fa fa-filter"></i></a></li>
            </ul>
        </div>

        <!-- inhoud van zijbalk -->
        <div class="leaflet-sidebar-content">
            <!-- inhoud schepen zoeken zijbalk -->
            <div class="leaflet-sidebar-pane" id="vesselsTab">

                <h1 class="leaflet-sidebar-header">
                    <span id="main-title">Schip zoeken</span>
                    <span class="leaflet-sidebar-close">
                        <i class="fa fa-caret-right"></i>
                    </span>
                </h1>

                <div id="main-search">
                    <input type="text" id="vessel-search" class="searchfield" placeholder="Scheepsnaam / IMO nummer...">
                    <div id="vessel-search-results"></div>
                </div>

                <div id="main-vessel-info" style="display: none">
                    <div class="title">
                        <i id="vessel-back-button" class="fa fa-arrow-circle-left back-button"></i>
                        <h4 id="vessel-name"></h4>
                    </div>
                    <table id="vessel-info-content" class="table"></table>
                </div>

            </div>

            <!-- inhoud havens zoeken zijbalk -->
            <div class="leaflet-sidebar-pane" id="portsTab">

                <h1 class="leaflet-sidebar-header">
                    <span id="main-title">Haven zoeken</span>
                    <span class="leaflet-sidebar-close">
                        <i class="fa fa-caret-right"></i>
                    </span>
                </h1>

                <div id="main-search">
                    <input type="text" id="port-search" class="searchfield" placeholder="Haven naam/nummer...">
                    <div id="port-search-results"></div>
                </div>

                <div id="main-port-info" style="display: none">
                    <div class="title">
                        <i id="port-back-button" class="fa fa-arrow-circle-left back-button"></i>
                        <h4 id="port-name"></h4>
                    </div>
                    <table id="port-info-content" class="table"></table>
                </div>

            </div>

            <!-- inhoud ligplaats zoeken zijbalk -->
            <div class="leaflet-sidebar-pane" id="berthsTab">

                <h1 class="leaflet-sidebar-header">
                    <span id="main-title">Ligplaats zoeken</span>
                    <span class="leaflet-sidebar-close">
                        <i class="fa fa-caret-right"></i>
                    </span>
                </h1>

                <div id="main-search">
                    <input type="text" id="berth-search" class="searchfield" placeholder="Ligplaats naam/nummer...">
                    <div id="berth-search-results"></div>
                </div>

                <div id="main-berth-info" style="display: none">
                    <div class="title">
                        <i id="berth-back-button" class="fa fa-arrow-circle-left back-button"></i>
                        <h4 id="berth-name"></h4>
                    </div>
                    <table id="berth-info-content" class="table"></table>
                </div>

            </div>

            <!-- inhoud legenda zijbalk -->
            <div class="leaflet-sidebar-pane" id="legendasTab">

                <div class="leaflet-sidebar-header sidebar-legenda-menu">
                    {{-- <span onclick="showLegendaElement('depthLegenda')" class="legenda-element">Diepte</span> --}}
                    <span onclick="showLegendaElement('schipLegenda')" class="legenda-element">Schepen</span>
                </div>

                {{-- <!-- Dieptetabel -->
                <div id="depthLegenda" style="display: none">
                    <img src="/img/depthLegend.png" alt="image not found">
                </div> --}}

                <!-- scheepsfilter en scheepskleuren tabel -->
                <div id="schipLegenda"
                {{-- style="display: none" --}}
                >
                    <table>
                        <tr>
                            <td>
                                <input type="checkbox" id="onbekend" name="onbekend" checked>
                            </td>
                            <td>
                                <img src="/img/boten/onbekend.png" alt="Grijs schepen">
                            </td>
                            <td>
                                Onbekend
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="checkbox" id="sleepboot" name="sleepboot" checked>
                            </td>
                            <td>
                                <img src="/img/boten/sleepboot.png" alt="Blauw schepen">
                            </td>
                            <td>
                                Sleepboot
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="checkbox" id="hogesnelheid" name="hogesnelheid" checked>
                            </td>
                            <td>
                                <img src="/img/boten/hogesnelheid.png" alt="Oranje schepen">
                            </td>
                            <td>
                                Hogesnelheid
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="checkbox" id="passagier" name="passagier" checked>
                            </td>
                            <td>
                                <img src="/img/boten/passagier.png" alt="Blauwe schepen">
                            </td>
                            <td>
                                Passagier
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="checkbox" id="vracht" name="vracht" checked>
                            </td>
                            <td>
                                <img src="/img/boten/vracht.png" alt="Groene schepen">
                            </td>
                            <td>
                                Vracht
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="checkbox" id="tanker" name="tanker" checked>
                            </td>
                            <td>
                                <img src="/img/boten/tanker.png" alt="Rode schepen">
                            </td>
                            <td>
                                Tanker
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="checkbox" id="yacht" name="yacht" checked>
                            </td>
                            <td>
                                <img src="/img/boten/yacht.png" alt="Roze schepen">
                            </td>
                            <td>
                                Yacht, Overige
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="checkbox" id="visschepen" name="visschepen" checked>
                            </td>
                            <td>
                                <img src="/img/boten/visschepen.png" alt="Gele schepen">
                            </td>
                            <td>
                                Visschepen
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="leaflet-sidebar-pane" id="messages">
                <h1 class="leaflet-sidebar-header">Messages<span class="leaflet-sidebar-close"><i
                            class="fa fa-caret-left"></i></span></h1>
            </div>
        </div>
    </div>

    <div id="map"></div>

    <script>
        function showLegendaElement(id) {

            let elements = ['depthLegenda', 'schipLegenda'];
            let selectedElement = elements.indexOf(id);
            let shownElement = document.getElementById(id);
            shownElement.style.display = '';
            elements.splice(selectedElement, 1);
            elements.forEach(element => {
                document.getElementById(element).style.display = 'none';
            });
        }
    </script>
</body>

</html>
