<?php

namespace Tests\Feature;

use App\Services\DinaAiService;
use Tests\TestCase;

class DinaAiServiceTest extends TestCase
{
    public function test_it_finds_the_digital_twin_definition_faq(): void
    {
        $service = new DinaAiService();

        $answer = $service->findFaqAnswer('Apa itu Digital Twin?');

        $this->assertNotNull($answer);
        $this->assertStringContainsString('representasi virtual', strtolower($answer));
    }

    public function test_it_returns_null_when_question_is_not_in_the_knowledge_base(): void
    {
        $service = new DinaAiService();

        $this->assertNull($service->findFaqAnswer('Bagaimana cuaca hari ini?'));
    }

    public function test_it_uses_literacy_context_for_unmatched_digital_twin_questions(): void
    {
        $service = new DinaAiService();

        $answer = $service->answer(
            'Bagaimana hubungan closed loop dengan pembelajaran sistem?',
            'Closed loop living twin menjaga hubungan dunia nyata dan representasi digital melalui sensing, understanding, acting, dan learning.\n\nData baru dari tindakan digunakan untuk memperbarui model dan keputusan berikutnya.'
        );

        $this->assertStringContainsString('Closed loop living twin', $answer['answer']);
        $this->assertSame('Twini AI', $answer['agent']);
    }

    public function test_it_matches_paraphrased_questions_to_the_most_relevant_answer(): void
    {
        $service = new DinaAiService();

        $answer = $service->answer('Bagaimana AI dipakai di Digital Twin?');

        $this->assertStringContainsString('mendeteksi anomali', strtolower($answer['answer']));
    }

    public function test_it_answers_specific_domain_questions_with_one_keyword(): void
    {
        $service = new DinaAiService();

        $answer = $service->answer('Apa itu sensor?');

        $this->assertStringContainsString('mata dan telinga', strtolower($answer['answer']));
    }

    public function test_it_keeps_bim_and_gis_questions_on_their_topic(): void
    {
        $service = new DinaAiService();

        $answer = $service->answer('Apa hubungan BIM dan GIS dengan Digital Twin?');

        $this->assertStringContainsString('fondasi awal Digital Twin', $answer['answer']);
    }
}
