/**
 * Item Elaboration API Endpoint
 * 
 * This endpoint demonstrates how AI can solve everyday problems with context-aware solutions.
 * 
 * Problem: Receipt items are often abbreviated or unclear (e.g., "ORGS", "BREAD WHL", "MILK 2%")
 * 
 * Our AI Solution:
 * - Uses the item name, price, and store context to understand what the item likely is
 * - Leverages receipt text for additional context clues
 * - Generates helpful explanations that make bill splitting more transparent
 * 
 * This approach shows how modern AI APIs can enhance user experience by providing
 * intelligent context and explanations for unclear data.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 });
    }

    const { itemName, itemPrice, receiptText, storeName } = await request.json();

    if (!itemName) {
      return NextResponse.json({ error: 'Item name is required.' }, { status: 400 });
    }

    const prompt = `You are helping to clarify what a grocery store item is. Based on the following information, provide a helpful description of what this item likely is:

Item Name: "${itemName}"
Price: $${itemPrice?.toFixed(2) || 'unknown'}
Store: ${storeName || 'Unknown store'}
Receipt Context: ${receiptText ? receiptText.substring(0, 500) : 'No additional context'}

Please provide a brief, helpful description (2-3 sentences) that explains:
1. What this item likely is (food, household item, etc.)
2. Common uses or context for this item
3. Why someone might buy it at this price point

Be specific and helpful. If the item name is unclear or abbreviated, make your best educated guess based on the price, store type, and any context from the receipt. Focus on being practical and informative.

Examples:
- "ORGS" at $3.99 → "This appears to be organic produce, likely organic fruits or vegetables. Organic items typically cost more than conventional produce."
- "BREAD WHL" at $2.49 → "This is whole wheat bread, a healthy staple food item. Whole grain breads are popular for sandwiches and toast."
- "MILK 2%" at $3.79 → "This is 2% reduced-fat milk, a common dairy product. The price suggests it's regular-sized (gallon) milk from a grocery store."`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    const elaboration = response.choices[0]?.message?.content?.trim();

    if (!elaboration) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ elaboration });

  } catch (error: unknown) {
    console.error('Error generating item elaboration:', error);
    
    // Fallback response
    const fallbackElaboration = `This appears to be a grocery store item. You might want to check your receipt or ask the person who bought it for more details.`;
    
    return NextResponse.json({ elaboration: fallbackElaboration });
  }
}
