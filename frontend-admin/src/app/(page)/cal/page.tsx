'use client';
import { useState } from 'react';
import { Layout, Input, Button, message } from 'antd';
import Sidebar from '@/app/_components/common/Sidebar';
import { pricingConfigServices } from '@/app/services/pricingServices';

const { Header, Content } = Layout;

interface TieredPricing {
  range: number;
  price: number;
}

export default function PriceCalculator() {
    const [baseUnit, setBaseUnit] = useState<number>(30);
    const [totalUnits, setTotalUnits] = useState<number>(0);
    const [tieredPricing, setTieredPricing] = useState<TieredPricing[]>([
        { range: 0, price: 32000 },
        { range: 60, price: 28000 }
    ]);
    const [result, setResult] = useState<{
        totalPrice: number;
        calculations: string[];
    } | null>(null);
    

    const handleCalculate = async () => {
        try {
            const data = {
                base_unit: baseUnit,
                tiered_pricing: tieredPricing,
                total_units: totalUnits
            };

            const response = await pricingConfigServices.calculatePrice(data);
            setResult(response);
            message.success('Tính giá thành công');
        } catch (error) {
            console.error('Error calculating price:', error);
            message.error('Có lỗi xảy ra khi tính giá');
        }
    };

    const updateTieredPricing = (index: number, field: 'range' | 'price', value: number) => {
        const newTieredPricing = [...tieredPricing];
        newTieredPricing[index][field] = value;
        setTieredPricing(newTieredPricing);
    };

    return (
        <Layout>
            <Sidebar />
            <Layout>
                <Header className="bg-white p-4 flex items-center">
                    <h2 className="text-xl font-semibold ml-7">Tính Giá Dịch Vụ</h2>
                </Header>
                <Content className="m-6 p-6 bg-white">
                    <div className="max-w-2xl mx-auto">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Đơn vị cơ bản (km):</label>
                                <Input
                                    type="number"
                                    value={baseUnit}
                                    onChange={(e) => setBaseUnit(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tổng số đơn vị (km):</label>
                                <Input
                                    type="number"
                                    value={totalUnits}
                                    onChange={(e) => setTotalUnits(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Bảng giá theo khoảng cách:</label>
                                {tieredPricing.map((tier, index) => (
                                    <div key={index} className="flex gap-4 mb-4">
                                        <div className="flex-1">
                                            <label className="block text-sm mb-1">Khoảng cách (km):</label>
                                            <Input
                                                type="number"
                                                value={tier.range}
                                                onChange={(e) => updateTieredPricing(index, 'range', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm mb-1">Giá (VNĐ):</label>
                                            <Input
                                                type="number"
                                                value={tier.price}
                                                onChange={(e) => updateTieredPricing(index, 'price', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button type="primary" onClick={handleCalculate} className="w-full">
                                Tính Giá
                            </Button>

                            {result && (
                                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                                    <h3 className="text-lg font-semibold mb-3">Kết quả tính giá:</h3>
                                    <p className="text-xl font-bold text-blue-600 mb-4">
                                        Tổng tiền: {result.totalPrice.toLocaleString()} VNĐ
                                    </p>
                                    <div>
                                        <h4 className="font-medium mb-2">Chi tiết tính toán:</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {result.calculations.map((calc, index) => (
                                                <li key={index} className="text-gray-600">{calc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
