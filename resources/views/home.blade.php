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
</head>
<body>
    <!-- optionally define the sidebar content via HTML markup -->
    <div id="sidebar" class="leaflet-sidebar collapsed">

        <!-- nav tabs -->
        <div class="leaflet-sidebar-tabs">
            <!-- top aligned tabs -->
            <ul role="tablist">
                <li><a href="#home" role="tab"><i class="fa fa-ship active"></i></a></li>
                <li><a href="#ligplaatsTab" role="tab"><i class="fa fa-anchor"></i></a></li>
                <li><a href="#legendaTab" role="tab"><i class="fa fa-table"></i></a></li>
            </ul>

            <!-- bottom aligned tabs -->
            {{-- <ul role="tablist">
                <li><a href="https://github.com/nickpeihl/leaflet-sidebar-v2"><i class="fa fa-github"></i></a></li>
            </ul> --}}
        </div>

        <!-- panel content -->
        <div class="leaflet-sidebar-content">
            <div class="leaflet-sidebar-pane" id="home">
                <h1 class="leaflet-sidebar-header">
                    <span id="main-title">Schip zoeken</span>
                    <span class="leaflet-sidebar-close"><i class="fa fa-caret-right"></i></span>
                </h1>
                <div id="main-search">
                    <input type="text" id="searchfield" class="searchfield" placeholder="Zoeken...">
                    <div id="searchresults"></div>
                </div>
                <div id="main-shipinfo" style="display: none">
                    <div class="title">
                        <i class="fa fa-arrow-circle-left back-button"></i>
                        <h4 id="shipname"></h4>
                    </div>
                    <table id="shipinfo-content" class="table">

                    </table>

                </div>
            </div>



            <div class="leaflet-sidebar-pane" id="ligplaatsTab">
                <h1 class="leaflet-sidebar-header">
                    <span id="main-ligplaatstitle">Ligplaats Zoeken</span>
                    <span class="leaflet-sidebar-close"><i class="fa fa-caret-right"></i></span>
                </h1>
                <div id="main-ligplaatssearch">
                    <input type="text" id="searchfieldLigplaats" class="searchfield" placeholder="Zoeken...">
                    <div id="searchresultsLigplaats"></div>
                </div>
                <div id="main-ligplaatsinfo" style="display: none">
                    <div class="title">
                        <i class="fa fa-arrow-circle-left back-button"></i>
                        <h4 id="ligplaatsname"></h4>
                    </div>
                    <table id="ligplaatsinfo-content" class="table">

                    </table>

                </div>
            </div>

            <div class="leaflet-sidebar-pane" id="legendaTab">
                <h1 class="leaflet-sidebar-header">
                    Legenda diepte
                </h1>
                <div id="main-legendaInfo" >
                    <img src="/img/diepteLegenda.png" alt=":(">
                </div>
            </div>

            <div class="leaflet-sidebar-pane" id="messages">
                <h1 class="leaflet-sidebar-header">Messages<span class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></span></h1>
            </div>
        </div>
    </div>

    <div id="map"></div>
    <script src="/js/app.js"></script>
</body>
</html>
