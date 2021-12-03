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

        <!-- nav tabs -->
        <div class="leaflet-sidebar-tabs">
            <!-- top aligned tabs -->
            <ul role="tablist">
                <li><a href="#vesselsTab" role="tab"><i class="fa fa-ship active"></i></a></li>
                <li><a href="#portsTab" role="tab"><i class="fa fa-anchor"></i></a></li>
                <li><a href="#berthsTab" role="tab"><i class="fa fa-anchor"></i></a></li>
                <li><a href="#legendsTab" role="tab"><i class="fa fa-table"></i></a></li>
            </ul>

            <!-- bottom aligned tabs -->
            {{-- <ul role="tablist">
                <li><a href="https://github.com/nickpeihl/leaflet-sidebar-v2"><i class="fa fa-github"></i></a></li>
            </ul> --}}
        </div>

        <!-- panel content -->
        <div class="leaflet-sidebar-content">
            <div class="leaflet-sidebar-pane" id="vesselsTab">
                <h1 class="leaflet-sidebar-header">
                    <span id="main-title">Search vessels</span>
                    <span class="leaflet-sidebar-close">
                        <i class="fa fa-caret-right"></i>
                    </span>
                </h1>
                <div id="main-search">
                    <input type="text" id="vessel-search" class="searchfield" placeholder="Enter vessel name...">
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

            <div class="leaflet-sidebar-pane" id="portsTab">
                <h1 class="leaflet-sidebar-header">
                    <span id="main-title">Search ports</span>
                    <span class="leaflet-sidebar-close">
                        <i class="fa fa-caret-right"></i>
                    </span>
                </h1>
                <div id="main-search">
                    <input type="text" id="port-search" class="searchfield" placeholder="Enter port name...">
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

            <div class="leaflet-sidebar-pane" id="berthsTab">
                <h1 class="leaflet-sidebar-header">
                    <span id="main-title">Search berths</span>
                    <span class="leaflet-sidebar-close">
                        <i class="fa fa-caret-right"></i>
                    </span>
                </h1>
                <div id="main-search">
                    <input type="text" id="berth-search" class="searchfield" placeholder="Enter berth name...">
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

            <div class="leaflet-sidebar-pane" id="legendsTab">
                <h1 class="leaflet-sidebar-header">
                    Legenda
                </h1>
                <div id="main-legendInfo">
                    <img src="/img/depthLegend.png" alt=":(">
                </div>
            </div>

            <div class="leaflet-sidebar-pane" id="messages">
                <h1 class="leaflet-sidebar-header">Messages<span class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></span></h1>
            </div>
        </div>
    </div>

    <div id="map"></div>
</body>
</html>
