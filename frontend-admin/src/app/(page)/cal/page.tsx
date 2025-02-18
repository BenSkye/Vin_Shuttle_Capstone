'use client';
import { useState } from 'react';
import { Layout, Input, Button, message, Radio, Space } from 'antd';
import Sidebar from '@/app/_components/common/Sidebar';
import { pricingConfigServices } from '@/app/services/pricingServices';

const { Header, Content } = Layout;

interface TieredPricing {
    range: number;
    price: number;
}

type UnitType = 'distance' | 'time';

export default function PriceCalculator() {
    const [baseUnit, setBaseUnit] = useState<number>(30);
    const [totalUnits, setTotalUnits] = useState<number>(0);
    const [unitType, setUnitType] = useState<UnitType>('distance');
    const [tieredPricing, setTieredPricing] = useState<TieredPricing[]>([
        { range: 0, price: 32000 },
        { range: 60, price: 28000 }
    ]);
    const [result, setResult] = useState<{
        totalPrice: number;
        calculations: string[];
    } | null>(null);

    const handleAddTier = () => {
        setTieredPricing(prev => [
            ...prev,
            { range: prev[prev.length - 1]?.range + 30 || 30, price: 0 }
        ]);
    };

    const handleRemoveTier = (index: number) => {
        if (tieredPricing.length > 1) {
            setTieredPricing(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleCalculate = async () => {
        try {
            const data = {
                base_unit: baseUnit,
                tiered_pricing: tieredPricing,
                total_units: totalUnits,
                unit_type: unitType
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
                                <label className="block text-sm font-medium mb-2">Chọn đơn vị tính:</label>
                                <Radio.Group 
                                    value={unitType} 
                                    onChange={e => setUnitType(e.target.value)}
                                    className="mb-4"
                                >
                                    <Space direction="horizontal">
                                        <Radio value="distance">Khoảng cách (km)</Radio>
                                        <Radio value="time">Thời gian (phút)</Radio>
                                    </Space>
                                </Radio.Group>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Đơn vị cơ bản ({unitType === 'distance' ? 'km' : 'phút'}):
                                </label>
                                <Input
                                    type="number"
                                    value={baseUnit}
                                    onChange={(e) => setBaseUnit(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tổng số đơn vị ({unitType === 'distance' ? 'km' : 'phút'}):
                                </label>
                                <Input
                                    type="number"
                                    value={totalUnits}
                                    onChange={(e) => setTotalUnits(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium">
                                        Bảng giá theo {unitType === 'distance' ? 'khoảng cách' : 'thời gian'}:
                                    </label>
                                    <Button 
                                        type="dashed" 
                                        onClick={handleAddTier}
                                        className="mb-2"
                                    >
                                        + Thêm khoảng
                                    </Button>
                                </div>
                                {tieredPricing.map((tier, index) => (
                                    <div key={index} className="flex gap-4 mb-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-sm mb-1">
                                                {unitType === 'distance' ? 'Khoảng cách (km)' : 'Thời gian (phút)'}:
                                            </label>
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
                                        <Button 
                                            danger 
                                            type="text"
                                            onClick={() => handleRemoveTier(index)}
                                            disabled={tieredPricing.length <= 1}
                                        >
                                            Xóa
                                        </Button>
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
