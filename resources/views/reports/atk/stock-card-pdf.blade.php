<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu Stok - {{ $item->kode_barang }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
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
        .info-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 5px;
        }
        .info-table .label {
            font-weight: bold;
            width: 150px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
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
        }
        .table .text-right {
            text-align: right;
        }
        .table .text-center {
            text-align: center;
        }
        .summary {
            margin-top: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
        }
        .summary table {
            width: 100%;
        }
        .summary td {
            padding: 5px;
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
    </style>
</head>
<body>
    <div class="header">
        <h1>KARTU STOK BARANG</h1>
        <h2>Alat Tulis Kantor</h2>
    </div>

    <table class="info-table">
        <tr>
            <td class="label">Kode Barang:</td>
            <td>{{ $item->kode_barang }}</td>
        </tr>
        <tr>
            <td class="label">Nama Barang:</td>
            <td>{{ $item->nama_barang }}</td>
        </tr>
        <tr>
            <td class="label">Satuan:</td>
            <td>{{ $item->satuan }}</td>
        </tr>
        <tr>
            <td class="label">Stok Saat Ini:</td>
            <td>{{ number_format($item->stok) }} {{ $item->satuan }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal Cetak:</td>
            <td>{{ now()->format('d/m/Y H:i') }}</td>
        </tr>
    </table>

    <h3>Riwayat Mutasi Stok</h3>

    @if($mutations->count() > 0)
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 18%">Tanggal</th>
                    <th style="width: 15%">Jenis Mutasi</th>
                    <th style="width: 10%" class="text-right">Jumlah</th>
                    <th style="width: 12%" class="text-right">Stok Sebelum</th>
                    <th style="width: 12%" class="text-right">Stok Sesudah</th>
                    <th style="width: 15%">Referensi</th>
                    <th style="width: 13%">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($mutations as $index => $mutation)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $mutation->created_at->format('d/m/Y H:i') }}</td>
                        <td>
                            @if($mutation->jenis_mutasi === 'masuk')
                                <span style="color: green;">MASUK</span>
                            @elseif($mutation->jenis_mutasi === 'keluar')
                                <span style="color: red;">KELUAR</span>
                            @else
                                <span style="color: blue;">ADJUSTMENT</span>
                            @endif
                        </td>
                        <td class="text-right">{{ number_format($mutation->jumlah) }}</td>
                        <td class="text-right">{{ number_format($mutation->stok_sebelum) }}</td>
                        <td class="text-right">{{ number_format($mutation->stok_sesudah) }}</td>
                        <td>{{ $mutation->referensi_tipe }}: {{ $mutation->referensi_id }}</td>
                        <td>{{ $mutation->keterangan ?: '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p><em>Tidak ada data mutasi stok.</em></p>
    @endif

    <div class="summary">
        <h4>Ringkasan</h4>
        <table>
            <tr>
                <td style="width: 200px;">Total Mutasi:</td>
                <td>{{ number_format($summary['total_mutations']) }}</td>
            </tr>
            <tr>
                <td>Total Masuk:</td>
                <td style="color: green;">{{ number_format($summary['total_masuk']) }}</td>
            </tr>
            <tr>
                <td>Total Keluar:</td>
                <td style="color: red;">{{ number_format($summary['total_keluar']) }}</td>
            </tr>
            <tr>
                <td>Total Adjustment:</td>
                <td style="color: blue;">{{ number_format($summary['total_adjustment']) }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <div class="signature">
            <p>Mengetahui,</p>
            <p>Kepala Gudang</p>
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
