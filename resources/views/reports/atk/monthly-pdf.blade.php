<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Bulanan ATK - {{ $period['nama_bulan'] }} {{ $period['tahun'] }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
        }
        .header h2 {
            margin: 5px 0 0 0;
            font-size: 14px;
        }
        .period {
            text-align: center;
            margin-bottom: 20px;
            font-size: 13px;
            font-weight: bold;
        }
        .summary-box {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
        }
        .summary-box table {
            width: 100%;
        }
        .summary-box td {
            padding: 5px;
        }
        .summary-box .label {
            font-weight: bold;
        }
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section h3 {
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .table th,
        .table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        .table th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 11px;
        }
        .table td {
            font-size: 11px;
        }
        .table .text-right {
            text-align: right;
        }
        .table .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 50px;
            text-align: right;
            font-size: 10px;
        }
        .signature {
            display: inline-block;
            width: 200px;
            text-align: center;
            margin-left: 20px;
        }
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN BULANAN ATK</h1>
        <h2>Alat Tulis Kantor</h2>
    </div>

    <div class="period">
        Periode: {{ $period['nama_bulan'] }} {{ $period['tahun'] }}
    </div>

    <div class="summary-box">
        <h3>Ringkasan Bulanan</h3>
        <table>
            <tr>
                <td class="label" style="width: 250px;">Total Pembelian:</td>
                <td>{{ number_format($summary['total_purchases']) }}</td>
            </tr>
            <tr>
                <td class="label">Total Nilai Pembelian:</td>
                <td>Rp {{ number_format($summary['total_purchase_value'], 2, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="label">Total Permintaan:</td>
                <td>{{ number_format($summary['total_requests']) }}</td>
            </tr>
            <tr>
                <td class="label">Total Permintaan Disetujui:</td>
                <td>{{ number_format($summary['total_requests_approved']) }}</td>
            </tr>
            <tr>
                <td class="label">Total Stock Opname:</td>
                <td>{{ number_format($summary['total_stock_opnames']) }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h3>Pembelian (Purchases)</h3>
        @if($purchases->count() > 0)
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 18%">No Pembelian</th>
                        <th style="width: 15%">Tanggal</th>
                        <th style="width: 25%">Supplier</th>
                        <th style="width: 18%" class="text-right">Total Nilai</th>
                        <th style="width: 12%">Status</th>
                        <th style="width: 7%">Item</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($purchases as $index => $purchase)
                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td>{{ $purchase->no_pembelian }}</td>
                            <td>{{ $purchase->tanggal->format('d/m/Y') }}</td>
                            <td>{{ $purchase->supplier }}</td>
                            <td class="text-right">Rp {{ number_format($purchase->total_nilai, 2, ',', '.') }}</td>
                            <td class="text-center">{{ $purchase->status }}</td>
                            <td class="text-center">{{ $purchase->purchaseDetails->count() }}</td>
                        </tr>
                    @endforeach
                    <tr style="font-weight: bold; background-color: #f0f0f0;">
                        <td colspan="4" class="text-right">TOTAL:</td>
                        <td class="text-right">Rp {{ number_format($purchases->sum('total_nilai'), 2, ',', '.') }}</td>
                        <td colspan="2"></td>
                    </tr>
                </tbody>
            </table>
        @else
            <p><em>Tidak ada data pembelian pada periode ini.</em></p>
        @endif
    </div>

    <div class="page-break"></div>

    <div class="section">
        <h3>Permintaan (Requests)</h3>
        @if($requests->count() > 0)
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 18%">No Permintaan</th>
                        <th style="width: 15%">Tanggal</th>
                        <th style="width: 20%">Pemohon</th>
                        <th style="width: 20%">Departemen</th>
                        <th style="width: 12%">Status</th>
                        <th style="width: 10%" class="text-right">Item</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($requests as $index => $request)
                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td>{{ $request->no_permintaan }}</td>
                            <td>{{ $request->tanggal->format('d/m/Y') }}</td>
                            <td>{{ $request->user->name }}</td>
                            <td>{{ $request->department->nama_department }}</td>
                            <td class="text-center">{{ $request->status }}</td>
                            <td class="text-center">{{ $request->requestDetails->count() }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p><em>Tidak ada data permintaan pada periode ini.</em></p>
        @endif
    </div>

    <div class="section">
        <h3>Stock Opname</h3>
        @if($stock_opnames->count() > 0)
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 20%">No SO</th>
                        <th style="width: 18%">Tanggal</th>
                        <th style="width: 25%">Periode</th>
                        <th style="width: 15%">Status</th>
                        <th style="width: 17%" class="text-right">Total Selisih</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($stock_opnames as $index => $so)
                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td>{{ $so->no_so }}</td>
                            <td>{{ $so->tanggal->format('d/m/Y') }}</td>
                            <td>{{ $so->periode_bulan }} {{ $so->periode_tahun }}</td>
                            <td class="text-center">{{ $so->status }}</td>
                            <td class="text-right">
                                {{ number_format($so->stockOpnameDetails->sum('selisih')) }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p><em>Tidak ada data stock opname pada periode ini.</em></p>
        @endif
    </div>

    <div class="footer">
        <div class="signature">
            <p>Mengetahui,</p>
            <p>Kepala Gudang ATK</p>
            <div class="signature-line"></div>
        </div>
        <div class="signature">
            <p>&nbsp;</p>
            <p>{{ now()->format('d/m/Y') }}</p>
            <div class="signature-line"></div>
        </div>
    </div>
</body>
</html>
